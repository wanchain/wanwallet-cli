const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
//const execSync = require('child_process').execSync;
const exec = require('child_process').exec;

Given('a wallet with address {string}', function(string) {
    this.setAddress(string);
});

Then('the balance should be {string}', function(string) {
    expect(this.getBalance()).to.eql(string);
});

Given('a new wallet address', function () {
    // Write code here that turns the phrase above into concrete actions
    this.getNewAddress();
});

When('I Recharge', function () {
    // TODO: This won't work now.. its async so the balance won't be updated instant
    cmdStr = 'curl -s -d "userAddr=' + this.address + '" ' + this.config.host + ':3000/faucet && sleep 30';
    let tx='';
    exec(cmdStr, function(err,stdout,stderr){
        tx=stdout.substr(9);
    });
});
