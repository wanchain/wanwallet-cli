#!/bin/bash
# TODO: Fix logging to show complete flow
# We are going to test all functions from command line
# Go to src directory
cd ../src

if [ ! -f keystore/test1.json ]
then
    # First create 3 keystores
    node createKeystore --ordinaryKeystore test1 --keyPassword 1234ab >/dev/null
    if [ -f keystore/test1.json ]
    then
      addr1=`cat keystore/test1.json|jq -r '.[1] .address'`
      waddr1=`cat keystore/test1.json|jq -r '.[1] .waddress'`
      echo "Test createKeystore 1 OK"
    else
      echo Error creating keystore
      echo "Test createKeystore 1 FAIL"
      exit
    fi

    node createKeystore --ordinaryKeystore test2 --keyPassword 1234ab >/dev/null
    if [ -f keystore/test1.json ]
    then
      addr2=`cat keystore/test2.json|jq -r '.[1] .address'`
      waddr2=`cat keystore/test2.json|jq -r '.[1] .waddress'`
      echo "Test createKeystore 2 OK"
    else
      echo Error creating keystore
      echo "Test createKeystore 2 FAIL"
      exit
    fi

    node createKeystore --ordinaryKeystore test3 --keyPassword 1234ab >/dev/null
    if [ -f keystore/test1.json ]
    then
      addr3=`cat keystore/test3.json|jq -r '.[1] .address'`
      waddr3=`cat keystore/test3.json|jq -r '.[1] .waddress'`
      echo "Test createKeystore 3 OK"
    else
      echo "Test createKeystore 3 FAIL"
      exit
    fi
else
  addr1=`cat keystore/test1.json|jq -r '.[1] .address'`
  waddr1=`cat keystore/test1.json|jq -r '.[1] .waddress'`
  addr2=`cat keystore/test2.json|jq -r '.[1] .address'`
  waddr2=`cat keystore/test2.json|jq -r '.[1] .waddress'`
  addr3=`cat keystore/test3.json|jq -r '.[1] .address'`
  waddr3=`cat keystore/test3.json|jq -r '.[1] .waddress'`
  echo "Test createKeystore 1 SKIP"
  echo "Test createKeystore 2 SKIP"
  echo "Test createKeystore 3 SKIP"
fi

bal1start=`node ordinaryBalance.js --ordinaryAddr $addr1|tail -1|awk -F\  '{print $2}'`
bal2start=`node ordinaryBalance.js --ordinaryAddr $addr2|tail -1|awk -F\  '{print $2}'`
bal3start=`node ordinaryBalance.js --ordinaryAddr $addr3|tail -1|awk -F\  '{print $2}'`

# Recharge wallet 1
tx1="faulet,"
num=0
# faucet sometimes fails; so retry until we get a hash back
while [ $tx1 == "faulet," ]
do
  tx1=`node recharge --ordinaryAddr $addr1|grep successful|awk -F\  '{print $6}'`
  let "num=num+1"
  sleep 5
  if [ $num -eq 10 ]
  then
    echo "Test recharge 1 FAIL (retried 10 times)"
    exit
  fi
done
confirmation=`node waitForTx --ordinaryTx $tx1|tail -1`
if [ "$confirmation" == "Confirmed" ]
then
  echo "Test recharge 1 OK (tx processed oldbalance $bal1start)"
else
  echo "Test recharge 1 FAIL (not confirmed tx: $confirmation)"
  exit
fi

# Recharge wallet 1
tx2="faulet,"
num=0
# faucet sometimes fails; so retry until we get a hash back
while [ $tx2 == "faulet," ]
do
  tx2=`node recharge --ordinaryAddr $addr2|grep successful|awk -F\  '{print $6}'`
  let "num=num+1"
  sleep 5
  if [ $num -eq 10 ]
  then
    echo "Test recharge 2 FAIL (retried 10 times)"
    exit
  fi
done
confirmation=`node waitForTx --ordinaryTx $tx2|tail -1`
if [ "$confirmation" == "Confirmed" ]
then
  echo "Test recharge 2 OK (tx processed oldbalance $bal2start)"
else
  echo "Test recharge 2 FAIL (not confirmed tx $confirmation)"
  exit
fi

# Check balance on both accounts
bal1=`node ordinaryBalance.js --ordinaryAddr $addr1|tail -1|awk -F\  '{print $2}'`
bal2=`node ordinaryBalance.js --ordinaryAddr $addr2|tail -1|awk -F\  '{print $2}'`

if [ $(echo "$bal1 == $bal1start + 12"|bc -l) ]
then
  echo "Test ordinaryBalance 1 OK ( newbalance $bal1)"
else
  echo "Test ordinaryBalance 1 FAIL"
  exit
fi

if [ $(echo "$bal2 == $bal2start + 12"|bc -l) ]
then
  echo "Test ordinaryBalance 2 OK ( newbalance $bal2)"
else
  echo "Test ordinaryBalance 2 FAIL"
  exit
fi

# Testing normal transfers
# 5 ether from account 1 to 3
tx=`node ordinaryTransaction.js --ordinaryKeystore test1 --keyPassword 1234ab --ordinaryState y --ordinaryAddr $addr3 --ordinaryValue 5|grep "tx hash"|awk -F\: '{print $2}'`
confirmation=`node waitForTx --ordinaryTx $tx|tail -1`
if [ "$confirmation" == "Confirmed" ]
then
  echo "Test ordinaryTransaction 1 OK ( tx processed oldbalance $bal3start )"
  bal3=`node ordinaryBalance.js --ordinaryAddr $addr3|tail -1|awk -F\  '{print $2}'`
  if [ $(echo "$bal3 == $bal3start + 5"|bc -l) ]
  then
    echo "Test ordinaryTransaction 1 OK ( wancoin received newbalance $bal3 )"
  else
    echo "Test ordinaryTransaction 1 FAIL"
    exit
  fi
else
  echo "Test ordinaryTransaction 1 FAIL (not confirmed tx $confirmation)"
  exit
fi

# Testing privacy transfer
# 5 ether from account 1 to 3
numOTAStart=`node otaBalance.js --privacyAddr $waddr3|grep -c otaData`
tx=`node privacyTransaction.js --ordinaryKeystore test1 --keyPassword 1234ab --ordinaryState y --privacyAddr $waddr2 --privacyValue 5|grep "tx hash"|awk -F\: '{print $2}'`
confirmation=`node waitForTx --ordinaryTx $tx|tail -1`
if [ "$confirmation" == "Confirmed" ]
then
  echo "Test privacyTransaction 1 OK tx processed"
  numOTAEnd=`node otaBalance.js --privacyAddr $waddr2|grep -c otaData`
  if [ $(echo "$numOTAStart + 1 == $numOTAEnd"|bc -l) ]
  then
    echo "Test privacyTransaction 1 OK wancoin received"
    echo "Test otaBalance 1 OK "
  else
    echo "Test privacyTransaction 1 FAIL (no new OTA)"
    echo "Test otaBalance 1 FAIL"
    exit
  fi
else
  echo "Test privacyTransaction 1 FAIL (not confirmed tx $confirmation)"
  exit
fi

# Test OTA Refund
# Get last OTA for address 2
txcost=0.00318768
bal2start=`node ordinaryBalance.js --ordinaryAddr $addr2|tail -1|awk -F\  '{print $2}'`
ota=`node otaBalance.js --privacyAddr $waddr2|tail -1 |awk -F\  '{print $7}'`
tx=`node otaRefund.js --ordinaryKeystore test2 --keyPassword 1234ab --ordinaryState y --privacyAddr $ota|grep "tx hash"|awk -F\: '{print $2}'`
confirmation=`node waitForTx --ordinaryTx $tx|tail -1`
if [ "$confirmation" == "Confirmed" ]
then
  bal2end=`node ordinaryBalance.js --ordinaryAddr $addr2|tail -1|awk -F\  '{print $2}'`
  if [ $(echo "$bal2end - $bal2start + $txcost == 5"|bc -l) ]
  then
    echo "Test otaRefund 1 OK"
  else
    echo "Test otaRefund 1 FAIL (balance incorrect)"
  fi
else
  echo "Test otaRefund 1 FAIL (not confirmed tx $confirmation)"
  exit
fi

# Buy two stamps
stamp1=`node tokenBuyStamp.js --ordinaryKeystore test3 --keyPassword 1234ab|grep "You have got a stamp"|awk -F\  '{print $10}'`
if [ $stamp1 == "" ]
then
    echo "Test tokenBuyStamp 1 FAIL (no stamp)"
else
  numstamps=`node stampBalance.js --ordinaryAddr $addr3|grep -c $stamp1`
  if [ $numstamps -eq 1 ]
  then
    echo "Test tokenBuyStamp 1 OK (stamp found)"
    echo "Test stampBalance 1 OK (stamp found)"
  else
    echo "Test stampBalance 1 FAIL (no stamp found)"
  fi
fi

stamp2=`node tokenBuyStamp.js --ordinaryKeystore test3 --keyPassword 1234ab|grep "You have got a stamp"|awk -F\  '{print $10}'`
if [ $stamp2 == "" ]
then
    echo "Test tokenBuyStamp 2 FAIL (no stamp)"
else
  numstamps=`node stampBalance.js --ordinaryAddr $addr3|grep -c $stamp2`
  if [ $numstamps -eq 1 ]
  then
    echo "Test tokenBuyStamp 2 OK (stamp found)"
    echo "Test stampBalance 2 OK (stamp found)"
  else
    echo "Test stampBalance 2 FAIL (no stamp found)"
  fi
fi

tx=`node tokenRecharge.js --ordinaryKeystore test3 --keyPassword 1234ab|grep "Tx hash"|awk -F\: '{print $2}'`
confirmation=`node waitForTx --ordinaryTx $tx|tail -1`
if [ "$confirmation" == "Confirmed" ]
then
  balance=`node tokenBalance.js --tokenAddr $addr3|grep $addr3|awk -F\  '{print $7}'`
  if [ $(echo "$balance == 1000000"|bc -l) ]
  then
    echo "Test tokenRecharge 1 OK (balance: $balance)"
  else
    echo "Test tokenRecharge 1 FAIL (balance incorrect)"
  fi
else
  echo "Test tokenRecharge 1 FAIL (not confirmed tx $confirmation)"
  exit
fi

# Transfer 500000 tokens to privacy address of account 3
otaaddr1=`node tokenTransaction.js --ordinaryKeystore test3 --keyPassword 1234ab --privacyAddr $waddr3 --tokenValue 500000 --stampAddr $stamp1|grep "Token balance of"|awk -F\  '{print $4}'`
if [ "$otaaddr1" == "" ]
then
  echo "Test tokenTransaction 1 FAIL (tx not completed)"
  exit
else
  balance=`node tokenBalance.js --tokenAddr $addr3|grep $otaaddr1|awk -F\  '{print $8}'`
  if [ $(echo "$balance == 500000"|bc -l) ]
  then
    echo "Test tokenTransaction 1 OK (balance: $balance)"
  else
    echo "Test tokenTransaction 1 FAIL (balance incorrect)"
  fi
fi

# Transfer 500000 tokens to privacy address of account 2 from privacy address of account 3
otaaddr2=`node tokenOTATransaction.js --ordinaryKeystore test3 --keyPassword 1234ab --tokenAddr $otaaddr1 --privacyAddr $waddr2 --stampAddr $stamp2|grep "Token balance of"|awk -F\  '{print $4}'`
if [ "$otaaddr2" == "" ]
then
  echo "Test tokenTransaction 1 FAIL (tx not completed)"
  exit
else
  balance=`node tokenBalance.js --tokenAddr $addr2|grep $otaaddr2|awk -F\  '{print $8}'`
  if [ $(echo "$balance == 500000"|bc -l) ]
  then
    echo "Test tokenTransaction 1 OK (balance: $balance)"
  else
    echo "Test tokenTransaction 1 FAIL (balance incorrect)"
  fi
fi

# rm keystore/test*.json