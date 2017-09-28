pragma solidity ^0.4.15;

contract VuziChat {

    // A topic
    struct Topic {
        uint id;
        string name;
        address owner;
        bool open;
    }

    // A message, in a topic
    struct Message {
        uint topic;
        address sender;
        string message;
    }

    // A private message between two user
    struct PrivateMessage {
        address sender;
        address receiver;
        string message;
    }

    uint internal lastTopic; 
    mapping (uint => Topic) public topics;
    mapping (uint => Message[]) public messages;
    mapping (address => PrivateMessage[]) public privateMessages;

    event MessageReceived(uint topic, address from, string message);
    event PrivateMessageReceived(address from, address to, string message);
    event TopicCreated(uint topic, string title);
    event TopicDeleted(uint topic);

    // The admin
    address public admin;

    // Events allow light clients to react on
    // changes efficiently.
    event Sent(address from, address to, uint amount);

    // This is the constructor whose code is
    // run only when the contract is created.
    function VuziChat() {
        admin = msg.sender;
        topics[1] = Topic(1, "General", msg.sender, true);
        lastTopic = 1;
    }
    
    function post(uint topic, string message) {
        Topic memory foundTopic = topics[topic];

        // Check for the topic id
        require(foundTopic.id > 0 && foundTopic.open);
        
        // Create message
        messages[topic].push(Message(topic, msg.sender, message));

        // Event
        MessageReceived(topic, msg.sender, message);
    }

    function privatePost(address receiver, string message) {
        // Juste send the private message..
        privateMessages[receiver].push(PrivateMessage(msg.sender, receiver, message));
        
        // Event
        PrivateMessageReceived(receiver, msg.sender, message);
    }


    function createTopic(string topicTitle) {
        // Inc the last ID
        lastTopic += 1;

        // Create the topic
        topics[lastTopic] = Topic(lastTopic, topicTitle, msg.sender, true);

        // Event
        TopicCreated(lastTopic, topicTitle);
    }

    function deleteTopic(uint topic) {
        Topic memory foundTopic = topics[topic];

        require(foundTopic.id > 0 && foundTopic.open);
        require(foundTopic.owner == msg.sender || admin == msg.sender);

        topics[topic].open = false;

        // Event
        TopicDeleted(foundTopic.id);
    }

}


