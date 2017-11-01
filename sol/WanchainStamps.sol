pragma solidity ^0.4.0;

//the contract is for develop poc
//
contract WanchainStamps {
    //gas cost for stamps
    //ws =
    // 0 means  never in
    // design the stamp value is 1,2,4,8,16,32,64,128
    // that mean 2**0 2**1 .... 2**7
    // there is only one stamp in a transaction.
    // when estimateStampLimit, we return these value too.
    // mapping (address => uint) public oneWs;
    // mapping (address => uint) public twoWs;

    // mapping (address => bytes) keys4Stamp;
    uint public stampPrice = 1000; //
    mapping (address => bytes) public StampListOne;
    address[] public StampArrayOne;
    uint public StampCountOne;

    mapping (address => bytes) public StampListTwo;
    address[] public StampArrayTwo;
    uint public StampCountTwo;

    mapping (address => bytes) public StampListFour;
    address[] public StampArrayFour;
    uint public StampCountFour;

    mapping (address => bytes) public StampListEight;
    address[] public StampArrayEight;
    uint public StampCountEight;

    mapping (address => bytes) public StampListSixteen;
    address[] public StampArraySixteen;
    uint public StampCountSixteen;
    address public Wallet = 0x132c9a9eaa470b7b32c6c615134cca36942c1afa;
    // d0363d233f0d32901cafa6d1edf185dc1b804fb3de4c3d8ddbdf248ff542e7b6

    stampType public lastStampType = stampType.TypeTwo;
    enum stampType {
        TypeOne,
        TypeTwo,
        TypeFour,
        TypeEight,
        TypeSixteen
    }
    function setStampPrice(uint price) {
        stampPrice = price;
    }

    event Debug(bytes32 message);
    event LogType(stampType);

    function typeValid(stampType _type) internal returns (bool){
        if(_type == stampType.TypeOne || _type == stampType.TypeTwo || _type == stampType.TypeFour
         || _type == stampType.TypeEight || _type == stampType.TypeSixteen){
            return true;
        } else{
            return false;
        }
    }


    function buyStamp(stampType _type, address otaAddress, bytes otaPubKey)
            payable
            public
    {
        LogType(_type);
        require(typeValid(_type));

        if (_type == stampType.TypeOne ){
            require (msg.value == 1 * stampPrice);
            StampListOne[otaAddress] = otaPubKey;
            StampArrayOne.push(otaAddress);
            StampCountOne += 1;
            Debug("Buy stamp one");
        }
        else if (_type == stampType.TypeTwo ){
            require (msg.value == 2 * stampPrice);
            StampListTwo[otaAddress] = otaPubKey;
            StampArrayTwo.push(otaAddress);
            StampCountTwo += 1;
            Debug("Buy stamp two");
        }
        else if (_type == stampType.TypeFour ){
            require (msg.value == 4 * stampPrice);
            StampListFour[otaAddress] = otaPubKey;
            StampArrayFour.push(otaAddress);
            StampCountFour += 1;
            Debug("Buy stamp four");
        }
        else if (_type == stampType.TypeEight ){
            require (msg.value == 8 * stampPrice);
            StampListEight[otaAddress] = otaPubKey;
            StampArrayEight.push(otaAddress);
            StampCountEight += 1;
            Debug("Buy stamp eight");
        }
        else if (_type == stampType.TypeSixteen ){
            require (msg.value == 16 * stampPrice);
            StampListSixteen[otaAddress] = otaPubKey;
            StampArraySixteen.push(otaAddress);
            StampCountSixteen += 1;
            Debug("Buy stamp sixteen");
        }
        Wallet.transfer(msg.value);
    }


}
