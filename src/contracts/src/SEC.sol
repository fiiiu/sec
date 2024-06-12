// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

// import "suave-std/suavelib/Suave.sol";
import "suave-std/Suapp.sol";

contract SEC is Suapp {

    struct Job {
        address employer;
        uint maxPay;
        mapping(bytes => bool) candidateRegistered;
        mapping(bytes => uint) candidateMinPays;
    }

    mapping(uint jobID => Job job) private jobs;
    uint private currentJobID;

    event onchainJobCreated(uint createdJobID);
    event onchainMinPaySet();
    event onchainMatched(bool matched);
    event offchainJobCreated(uint createdJobID);
    event offchainMinPaySet();
    event offchainMatched(bool matched);

    //onchain functions
    function createJobCallback(uint createdJobID) public emitOffchainLogs {
       emit onchainJobCreated(createdJobID);
    }

    function mootCallback() public {}

    function minPaySetCallback() public emitOffchainLogs {
        emit onchainMinPaySet();
    }

    function matchedCallback(bool matched) public emitOffchainLogs {
        emit onchainMatched(matched);
    }

    //offchain functions
    function createJob(uint maxPay) public returns (bytes memory) {
        Job storage newJob = jobs[currentJobID];
        newJob.employer = msg.sender;
        newJob.maxPay = maxPay;
        currentJobID++;
        emit offchainJobCreated(currentJobID - 1);
        return abi.encodeWithSelector(this.createJobCallback.selector, currentJobID - 1);
    }

    function newCandidate(uint jobID, bytes memory candidateID) public returns (bytes memory) {
        //require sender is jobID creator
        require(msg.sender == jobs[jobID].employer);
        jobs[jobID].candidateRegistered[candidateID] = true;
        return abi.encodeWithSelector(this.mootCallback.selector);
    }

    function setMinPay(uint jobID, bytes memory candidateID, uint minPay) public returns (bytes memory) {
        //require candidate is registered
        require(jobs[jobID].candidateRegistered[candidateID]);
        //set candidate's minPay  
        jobs[jobID].candidateMinPays[candidateID] = minPay;
        //unregister candidate to prevent abuse
        jobs[jobID].candidateRegistered[candidateID] = false;
        emit offchainMinPaySet();
        return abi.encodeWithSelector(this.minPaySetCallback.selector);
    }

    function isMatch(uint jobID, bytes memory candidateID) public returns (bytes memory) {
        bool matched = jobs[jobID].candidateMinPays[candidateID] <= jobs[jobID].maxPay;
        emit offchainMatched(matched);
        return abi.encodeWithSelector(this.matchedCallback.selector, matched);
    }

 }
