const tmi = require('tmi.js');


let client;
let dockHost;

export function startChatbot(opts, chatbotMsgHandler) {
    // Create a client with our options
    client = new tmi.client(opts);
    dockHost = opts.channels[0].substr(1);
    // Register our event handlers (defined below)
    client.on('message', (target, context, msg, self) => {
      onMessageHandler(target, context, msg, self, chatbotMsgHandler, client);
    });
    client.on('connected', (addr, port) => onConnectedHandler(addr, port, chatbotMsgHandler));

    // Connect to Twitch:
    client.connect().catch((data) => {
      chatbotMsgHandler({
        type: 'chatbot-could-not-connect',
        data,
      })
    });
}

export function disconnectChatbot(chatbotMsgHandler) {
    client.disconnect().then((data) => {
        chatbotMsgHandler({
          type: 'chatbot-connection-status',
          data: false,
        })
    }).catch(err => console.log('error from disconnect: ', err));
}

export function returnDockedUsers(msg) {
  const data = msg.data

  const isUsers = data.docked.length > 0;
  let users;

  if(isUsers) {
    users = data.docked.reduce((prevValue, user, index) => prevValue + `http://twitch.tv/${user} `, '')
  } else {
    users = 'No one is currently docked.'
  }

  client.say(data.channel, users);
}

export function joinChat(msg) {
  const channel = '#' + msg.data
  client.join(channel)
}

export function leaveChat(msg) {
  const channel = '#' + msg.data
  client.part(channel)
}

const commandRoutes = {};

commandRoutes['!dock'] = ({context, chatbotMsgHandler, target, client}) => {
  client.say(target, '🚀dock request sent.')

  chatbotMsgHandler({
    type: 'new-dock-request',
    data: context.username,
  })
}

commandRoutes['!docked'] = ({context, chatbotMsgHandler, target, client}) => {
  chatbotMsgHandler({
    type: 'get-docked-users',
    data: {channel: target},
  })
}

commandRoutes['!dockhost'] = ({context, chatbotMsgHandler, target, client}) => {
  client.say(target, `This stream is docked at http://twitch.tv/${dockHost}`)
}

commandRoutes['!commands'] = ({context, chatbotMsgHandler, target, client}) => {
  client.say(target, '!dock, !undock, !docked, !dockhost, !commands')
}

commandRoutes['!undock'] = ({context, chatbotMsgHandler, target, client}) => {
  client.say(target, '👋undocking...')

  chatbotMsgHandler({
    type: 'undock-request',
    data: context.username,
  })
}

// Called every time a message comes in
function onMessageHandler (target, context, msg, self, chatbotMsgHandler, client) {
  if (self) { return; } // Ignore messages from the bot

  const msgData = {
    target,
    context,
    msg,
    self,
    chatbotMsgHandler,
    client
  }

  // Remove whitespace from chat message
  const commandName = msg.trim();

  if(Object.keys(commandRoutes).includes(commandName)) {
    commandRoutes[commandName](msgData);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port, chatbotMsgHandler) {
  console.log(`* Connected to ${addr}:${port}`);

  chatbotMsgHandler({
    type: 'chatbot-connection-status',
    data: true,
  });
}