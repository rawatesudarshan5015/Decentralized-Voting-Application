// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    // Structure for candidate
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    
    // Store Candidates
    // Fetch Candidate
    mapping(uint256 => Candidate) public candidates;
    
    // Store Candidates Count
    uint256 public candidatesCount;
    
    // Event when a vote is cast
    event VotedEvent(uint256 indexed _candidateId);

    constructor() {
        // Add candidates during contract deployment
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
    }

    // Add a candidate
    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Vote function
    function vote(uint256 _candidateId) public {
        // Require that voter hasn't voted before
        require(!voters[msg.sender], "You have already voted");
        
        // Require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        // Record that voter has voted
        voters[msg.sender] = true;

        // Update candidate vote count
        candidates[_candidateId].voteCount++;

        // Trigger voted event
        emit VotedEvent(_candidateId);
    }

    // Get voting status of an address
    function hasVoted(address _address) public view returns (bool) {
        return voters[_address];
    }

    // Get candidate information
    function getCandidate(uint256 _candidateId) public view returns (uint256, string memory, uint256) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    // Get total number of candidates
    function getCandidatesCount() public view returns (uint256) {
        return candidatesCount;
    }
}