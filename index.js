<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Web - Live Location, Video Call & KBC Audience Call</title>
    
    <!-- Emoji Picker -->
    <script type="module" src="https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js"></script>
    
    <!-- Leaflet OpenStreetMap -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background-color: #0c1317; height: 100vh; display: flex; justify-content: center; align-items: center; color: #e9edef; }

        /* Auth Screen */
        #auth-screen { background: #111b21; padding: 30px; border-radius: 12px; width: 90%; max-width: 380px; border: 1px solid #222d34; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        #auth-screen h2 { color: #00a884; margin-bottom: 20px; text-align: center; font-size: 22px; }
        .input-group { margin-bottom: 15px; }
        .input-group input { width: 100%; padding: 12px 14px; border: 1px solid #222d34; background: #111b21; color: #e9edef; border-radius: 8px; font-size: 14px; outline: none; }
        .input-group input:focus { border-color: #00a884; }
        .avatar-upload-container { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; background: #182229; padding: 10px; border-radius: 8px; border: 1px dashed #2a3942; }
        .avatar-preview-box { width: 45px; height: 45px; border-radius: 50%; background: #6b7c85; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; color: #fff; font-weight: bold; }
        .avatar-preview-box img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-upload-label { font-size: 12px; color: #8696a0; cursor: pointer; }
        .avatar-upload-label span { color: #00a884; font-weight: 600; }
        .btn { width: 100%; padding: 12px; background: #00a884; color: #111b21; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
        .btn:hover { background: #008f6f; }
        .auth-toggle { margin-top: 15px; font-size: 13px; text-align: center; color: #8696a0; }
        .auth-toggle span { color: #00a884; cursor: pointer; text-decoration: underline; }
        #error-msg { color: #f15c6d; font-size: 13px; margin-bottom: 12px; text-align: center; display: none; }

        /* App Layout */
        #chat-screen { display: none; width: 100%; height: 100vh; background: #111b21; overflow: hidden; position: relative; }
        @media (min-width: 900px) { #chat-screen { width: 95%; max-width: 1300px; height: 92vh; border-radius: 8px; border: 1px solid #222d34; } }

        #sidebar { width: 100%; height: 100%; background: #111b21; border-right: 1px solid #222d34; display: flex; flex-direction: column; position: absolute; left: 0; top: 0; z-index: 2; transition: transform 0.3s ease; }
        @media (min-width: 768px) { #sidebar { width: 340px; position: relative; transform: none !important; } }

        .sidebar-header { height: 60px; padding: 0 16px; background: #202c33; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222d34; }
        .user-avatar-badge { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; }
        .avatar { width: 38px; height: 38px; border-radius: 50%; background: #6b7c85; display: flex; justify-content: center; align-items: center; color: #fff; font-weight: bold; text-transform: uppercase; overflow: hidden; flex-shrink: 0; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Status Section */
        #status-bar-container { padding: 12px 16px; border-bottom: 1px solid #222d34; background: #111b21; }
        .status-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #8696a0; margin-bottom: 10px; font-weight: 600; letter-spacing: 0.5px; }
        .add-status-btn { color: #00a884; cursor: pointer; font-size: 12px; font-weight: 600; }
        .add-status-btn:hover { text-decoration: underline; }
        #status-list { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; }
        #status-list::-webkit-scrollbar { height: 3px; }
        #status-list::-webkit-scrollbar-thumb { background: #2a3942; border-radius: 3px; }
        .status-item { display: flex; flex-direction: column; align-items: center; width: 56px; cursor: pointer; flex-shrink: 0; }
        .status-ring { width: 48px; height: 48px; border-radius: 50%; padding: 2px; border: 2px solid #00a884; display: flex; align-items: center; justify-content: center; }
        .status-ring .avatar { width: 100%; height: 100%; }
        .status-username { font-size: 11px; color: #8696a0; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; text-align: center; }

        .logout-btn { background: transparent; color: #8696a0; border: 1px solid #3b4a54; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .logout-btn:hover { color: #f15c6d; border-color: #f15c6d; }

        #user-list { list-style: none; overflow-y: auto; flex: 1; }
        #user-list li { padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid #111b21; }
        #user-list li:hover, #user-list li.active { background: #2a3942; }
        .contact-info { flex: 1; overflow: hidden; }
        .contact-name { font-size: 15px; color: #e9edef; font-weight: 500; }
        .contact-status { font-size: 12px; color: #00a884; margin-top: 2px; }

        /* Main Chat Window */
        #chat-area { flex: 1; display: flex; flex-direction: column; background: #0b141a; height: 100%; position: relative; }
        #chat-header { height: 60px; padding: 0 16px; background: #202c33; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #222d34; }
        .header-title-container { flex: 1; display: flex; align-items: center; gap: 10px; }
        #video-call-btn { background: none; border: none; color: #00a884; font-size: 20px; cursor: pointer; display: none; padding: 6px; }
        #video-call-btn:hover { color: #008f6f; }
        #back-btn { background: none; border: none; color: #00a884; font-size: 18px; cursor: pointer; display: block; }
        @media (min-width: 768px) { #back-btn { display: none; } }

        #no-chat-selected { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #8696a0; gap: 10px; background: #222e35; text-align: center; padding: 20px; }
        #active-chat-container { display: none; flex: 1; flex-direction: column; height: calc(100% - 60px); background-image: radial-gradient(#1f2c34 1px, transparent 0); background-size: 20px 20px; position: relative; }
        #messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }

        .message { max-width: 80%; padding: 8px 12px; border-radius: 8px; font-size: 14px; line-height: 1.4; position: relative; word-wrap: break-word; box-shadow: 0 1px 0.5px rgba(11,20,26,0.13); }
        .message .time { font-size: 11px; color: #8696a0; margin-top: 4px; text-align: right; float: right; margin-left: 12px; }
        .message.sent { align-self: flex-end; background: #005c4b; color: #e9edef; border-top-right-radius: 0; }
        .message.received { align-self: flex-start; background: #202c33; color: #e9edef; border-top-left-radius: 0; }

        .chat-image { max-width: 100%; max-height: 250px; border-radius: 6px; margin-top: 4px; display: block; cursor: pointer; }
        .chat-file-link { display: flex; align-items: center; gap: 8px; color: #00a884; text-decoration: none; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 6px; margin-top: 4px; font-weight: 500; }
        .chat-file-link:hover { text-decoration: underline; }

        /* Map Box Styling */
        .map-card { width: 250px; height: 150px; border-radius: 8px; margin-top: 4px; overflow: hidden; border: 1px solid #2a3942; }
        .location-btn-link { display: inline-block; margin-top: 6px; color: #00a884; text-decoration: none; font-weight: 600; font-size: 13px; }

        /* KBC Audience Call Style Box */
        .kbc-card {
            background: #111b21;
            border: 2px solid #ffb703;
            border-radius: 10px;
            padding: 12px;
            width: 280px;
            margin-top: 6px;
            box-shadow: 0 4px 10px rgba(255, 183, 3, 0.2);
        }
        .kbc-header {
            font-size: 12px;
            color: #ffb703;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .kbc-question {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #ffffff;
        }
        .kbc-option-btn {
            width: 100%;
            background: #202c33;
            border: 1px solid #2a3942;
            color: #e9edef;
            padding: 8px 10px;
            border-radius: 6px;
            margin-bottom: 6px;
            text-align: left;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        }
        .kbc-option-btn:hover { background: #2a3942; border-color: #ffb703; }
        .kbc-option-btn.selected { border-color: #00a884; background: #0b2b26; }
        .kbc-option-btn.correct { border-color: #25d366; background: #0a3d24 !important; }
        .kbc-option-btn.wrong { border-color: #f15c6d; background: #421118 !important; }

        .kbc-bar-fill {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background: rgba(255, 183, 3, 0.15);
            z-index: 1;
            transition: width 0.4s ease;
        }
        .kbc-option-text { z-index: 2; position: relative; }
        .kbc-percent { font-weight: bold; color: #ffb703; z-index: 2; position: relative; }

        #typing-indicator { padding: 0 20px 6px; font-size: 12px; color: #00a884; font-style: italic; height: 18px; }

        #file-preview-bar { display: none; align-items: center; justify-content: space-between; background: #182229; padding: 6px 16px; border-top: 1px solid #222d34; font-size: 13px; color: #8696a0; }
        #file-preview-bar span { color: #00a884; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
        #remove-file-btn { background: none; border: none; color: #f15c6d; font-size: 16px; cursor: pointer; font-weight: bold; }

        #emoji-picker-container { display: none; position: absolute; bottom: 65px; left: 16px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5); border-radius: 8px; overflow: hidden; }
        emoji-picker { --background: #111b21; --border-color: #222d34; --input-border-color: #2a3942; --input-placeholder-color: #8696a0; --outline-color: #00a884; height: 320px; width: 300px; }

        /* Toolbar & Message Inputs */
        #message-form { padding: 10px 16px; background: #202c33; display: flex; align-items: center; gap: 8px; }
        .action-btn { background: none; border: none; color: #8696a0; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; }
        .action-btn:hover { color: #00a884; }

        #message-input { flex: 1; padding: 11px 16px; border: none; background: #2a3942; color: #e9edef; border-radius: 8px; font-size: 14px; outline: none; }
        #message-form button[type="submit"] { background: #00a884; color: #111b21; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }

        /* Video Call UI */
        #video-call-modal { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 20, 26, 0.95); z-index: 1000; flex-direction: column; justify-content: center; align-items: center; }
        .video-container { position: relative; width: 90%; max-width: 800px; height: 70vh; background: #000; border-radius: 12px; overflow: hidden; display: flex; justify-content: center; align-items: center; }
        #remote-video { width: 100%; height: 100%; object-fit: cover; }
        #local-video { width: 150px; height: 100px; object-fit: cover; position: absolute; bottom: 20px; right: 20px; border-radius: 8px; border: 2px solid #00a884; background: #222; }
        .call-controls { margin-top: 20px; display: flex; gap: 20px; }
        .call-btn { padding: 12px 24px; border: none; border-radius: 50px; font-size: 16px; font-weight: 600; cursor: pointer; }
        .end-call-btn { background: #f15c6d; color: #fff; }
        .accept-call-btn { background: #00a884; color: #fff; }

        #incoming-call-box { display: none; position: fixed; top: 20px; right: 20px; background: #202c33; border: 1px solid #00a884; padding: 16px 20px; border-radius: 8px; z-index: 1001; box-shadow: 0 4px 15px rgba(0,0,0,0.5); align-items: center; gap: 15px; }

        /* Status & KBC Modals */
        #status-modal, #kbc-modal { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.85); z-index: 2000; justify-content: center; align-items: center; }
        #status-modal img { max-width: 90%; max-height: 70vh; border-radius: 8px; }
        .status-caption { margin-top: 15px; color: #e9edef; font-size: 16px; text-align: center; }
        .close-modal-btn { position: absolute; top: 20px; right: 25px; color: #fff; font-size: 28px; cursor: pointer; }

        /* Create KBC Poll Dialog */
        .kbc-dialog { background: #111b21; border: 1px solid #ffb703; padding: 20px; border-radius: 12px; width: 90%; max-width: 400px; }
        .kbc-dialog h3 { color: #ffb703; margin-bottom: 12px; font-size: 18px; text-align: center; }
        .kbc-dialog input, .kbc-dialog select { width: 100%; padding: 10px; margin-bottom: 10px; background: #202c33; border: 1px solid #2a3942; border-radius: 6px; color: #fff; outline: none; }

        .show-chat #sidebar { transform: translateX(-100%); }
        @media (min-width: 768px) { #chat-screen { display: flex !important; } .show-chat #sidebar { transform: none; } }
    </style>
</head>
<body>

    <!-- Auth Container -->
    <div id="auth-screen">
        <h2 id="auth-title">WhatsApp</h2>
        <div id="error-msg"></div>

        <div class="input-group" id="username-group" style="display: none;">
            <input type="text" id="username" placeholder="Username">
        </div>

        <div class="avatar-upload-container" id="avatar-group" style="display: none;">
            <div class="avatar-preview-box" id="avatar-preview">?</div>
            <label class="avatar-upload-label" for="profile-pic-input">
                <span>Upload Profile Photo</span>
                <br>JPEG or PNG (Max 2MB)
            </label>
            <input type="file" id="profile-pic-input" accept="image/*" style="display: none;">
        </div>

        <div class="input-group">
            <input type="email" id="email" placeholder="Email Address">
        </div>
        <div class="input-group">
            <input type="password" id="password" placeholder="Password">
        </div>

        <button class="btn" id="auth-submit-btn">Login</button>

        <div class="auth-toggle">
            <span id="toggle-auth-mode">Don't have an account? Register</span>
        </div>
    </div>

    <!-- Main Chat Screen -->
    <div id="chat-screen">
        <!-- Contacts Sidebar -->
        <div id="sidebar">
            <div class="sidebar-header">
                <div class="user-avatar-badge">
                    <div class="avatar" id="my-avatar">?</div>
                    <span id="my-profile">Profile</span>
                </div>
                <button class="logout-btn" id="logout-btn">Logout</button>
            </div>

            <!-- Status Bar Container -->
            <div id="status-bar-container">
                <div class="status-header">
                    <span>RECENT STATUSES</span>
                    <label class="add-status-btn" for="status-file-input">+ Add Status</label>
                    <input type="file" id="status-file-input" accept="image/*" style="display:none;">
                </div>
                <div id="status-list"></div>
            </div>

            <ul id="user-list"></ul>
        </div>

        <!-- Conversation Panel -->
        <div id="chat-area">
            <div id="chat-header">
                <button id="back-btn">←</button>
                <div class="header-title-container">
                    <div class="avatar" id="header-avatar" style="display: none;">?</div>
                    <div id="header-title" style="font-weight: 600;">WhatsApp Web</div>
                </div>
                <button id="video-call-btn" title="Start Video Call">📹</button>
            </div>

            <div id="no-chat-selected">
                <h3>WhatsApp Direct</h3>
                <p>Select an online user from the menu to start messaging.</p>
            </div>

            <div id="active-chat-container">
                <div id="messages"></div>
                <div id="typing-indicator"></div>

                <div id="file-preview-bar">
                    Attached: <span id="file-preview-name"></span>
                    <button id="remove-file-btn">✕</button>
                </div>

                <div id="emoji-picker-container">
                    <emoji-picker></emoji-picker>
                </div>

                <form id="message-form">
                    <button type="button" id="emoji-btn" class="action-btn" title="Insert Emoji">😊</button>

                    <label for="chat-file-input" class="action-btn" title="Attach file or image">📎</label>
                    <input type="file" id="chat-file-input" style="display: none;">

                    <!-- Live Location Button -->
                    <button type="button" id="location-btn" class="action-btn" title="Share Live Location">📍</button>

                    <!-- KBC Audience Poll Button -->
                    <button type="button" id="kbc-btn" class="action-btn" title="Send KBC Audience Call Poll">📊</button>

                    <input type="text" id="message-input" placeholder="Type a message..." autocomplete="off">
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    </div>

    <!-- KBC Poll Dialog Modal -->
    <div id="kbc-modal">
        <span class="close-modal-btn" id="close-kbc-btn">✕</span>
        <div class="kbc-dialog">
            <h3>📞 KBC Audience Call</h3>
            <input type="text" id="kbc-q" placeholder="Enter Question...">
            <input type="text" id="kbc-opt1" placeholder="Option A">
            <input type="text" id="kbc-opt2" placeholder="Option B">
            <input type="text" id="kbc-opt3" placeholder="Option C">
            <input type="text" id="kbc-opt4" placeholder="Option D">
            
            <label style="font-size: 12px; color: #ffb703;">Select Correct Answer:</label>
            <select id="kbc-correct">
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
            </select>

            <button class="btn" id="send-kbc-poll-btn" style="background:#ffb703; color:#111;">Send Audience Poll</button>
        </div>
    </div>

    <!-- Incoming Call Alert Popup -->
    <div id="incoming-call-box">
        <div><strong id="caller-name">User</strong> is calling you...</div>
        <button class="call-btn accept-call-btn" id="accept-call-btn">Accept</button>
        <button class="call-btn end-call-btn" id="reject-call-btn">Reject</button>
    </div>

    <!-- Video Call Overlay Container -->
    <div id="video-call-modal">
        <div class="video-container">
            <video id="remote-video" autoplay playsinline></video>
            <video id="local-video" autoplay playsinline muted></video>
        </div>
        <div class="call-controls">
            <button class="call-btn end-call-btn" id="hangup-call-btn">End Call</button>
        </div>
    </div>

    <!-- Status Viewer Modal -->
    <div id="status-modal">
        <span class="close-modal-btn" id="close-status-btn">✕</span>
        <img id="status-viewer-img" src="" alt="Status">
        <div class="status-caption" id="status-viewer-caption"></div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        let isLoginMode = true;
        let socket = null;
        let currentUser = null;
        let activeRecipientSocketId = null;
        let typingTimeout;
        let profilePicBase64 = null;
        let selectedFileData = null;

        // WebRTC Setup Variables
        let localStream = null;
        let peerConnection = null;
        let incomingCallerSocketId = null;
        let incomingOffer = null;

        const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const conversationHistory = {};

        // DOM References
        const authScreen = document.getElementById('auth-screen');
        const authTitle = document.getElementById('auth-title');
        const usernameGroup = document.getElementById('username-group');
        const avatarGroup = document.getElementById('avatar-group');
        const profilePicInput = document.getElementById('profile-pic-input');
        const avatarPreview = document.getElementById('avatar-preview');
        const authSubmitBtn = document.getElementById('auth-submit-btn');
        const toggleAuthMode = document.getElementById('toggle-auth-mode');
        const errorMsg = document.getElementById('error-msg');

        const chatScreen = document.getElementById('chat-screen');
        const myProfile = document.getElementById('my-profile');
        const myAvatar = document.getElementById('my-avatar');
        const logoutBtn = document.getElementById('logout-btn');
        const userList = document.getElementById('user-list');
        const headerTitle = document.getElementById('header-title');
        const headerAvatar = document.getElementById('header-avatar');
        const videoCallBtn = document.getElementById('video-call-btn');
        const backBtn = document.getElementById('back-btn');
        const noChatSelected = document.getElementById('no-chat-selected');
        const activeChatContainer = document.getElementById('active-chat-container');
        const messageForm = document.getElementById('message-form');
        const messageInput = document.getElementById('message-input');
        const messagesDiv = document.getElementById('messages');
        const typingIndicator = document.getElementById('typing-indicator');

        const chatFileInput = document.getElementById('chat-file-input');
        const filePreviewBar = document.getElementById('file-preview-bar');
        const filePreviewName = document.getElementById('file-preview-name');
        const removeFileBtn = document.getElementById('remove-file-btn');
        const locationBtn = document.getElementById('location-btn');

        // KBC Poll Elements
        const kbcBtn = document.getElementById('kbc-btn');
        const kbcModal = document.getElementById('kbc-modal');
        const closeKbcBtn = document.getElementById('close-kbc-btn');
        const sendKbcPollBtn = document.getElementById('send-kbc-poll-btn');

        const emojiBtn = document.getElementById('emoji-btn');
        const emojiPickerContainer = document.getElementById('emoji-picker-container');
        const emojiPicker = document.querySelector('emoji-picker');

        // Status Elements
        const statusList = document.getElementById('status-list');
        const statusFileInput = document.getElementById('status-file-input');
        const statusModal = document.getElementById('status-modal');
        const statusViewerImg = document.getElementById('status-viewer-img');
        const statusViewerCaption = document.getElementById('status-viewer-caption');
        const closeStatusBtn = document.getElementById('close-status-btn');

        // Video Call Elements
        const videoCallModal = document.getElementById('video-call-modal');
        const localVideo = document.getElementById('local-video');
        const remoteVideo = document.getElementById('remote-video');
        const incomingCallBox = document.getElementById('incoming-call-box');
        const callerNameSpan = document.getElementById('caller-name');
        const acceptCallBtn = document.getElementById('accept-call-btn');
        const rejectCallBtn = document.getElementById('reject-call-btn');
        const hangupCallBtn = document.getElementById('hangup-call-btn');

        toggleAuthMode.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            authTitle.textContent = isLoginMode ? 'WhatsApp' : 'Register';
            authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Register';
            usernameGroup.style.display = isLoginMode ? 'none' : 'block';
            avatarGroup.style.display = isLoginMode ? 'none' : 'flex';
            toggleAuthMode.textContent = isLoginMode ? "Don't have an account? Register" : "Already have an account? Login";
            errorMsg.style.display = 'none';
        });

        profilePicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) return alert("File size should be less than 2MB");
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicBase64 = e.target.result;
                    avatarPreview.innerHTML = `<img src="${profilePicBase64}" alt="Avatar">`;
                };
                reader.readAsDataURL(file);
            }
        });

        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPickerContainer.style.display = emojiPickerContainer.style.display === 'block' ? 'none' : 'block';
        });

        emojiPicker.addEventListener('emoji-click', event => {
            messageInput.value += event.detail.unicode;
            messageInput.focus();
        });

        document.addEventListener('click', (e) => {
            if (!emojiPickerContainer.contains(e.target) && e.target !== emojiBtn) {
                emojiPickerContainer.style.display = 'none';
            }
        });

        chatFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 15 * 1024 * 1024) return alert("File size limit is 15MB");
                const reader = new FileReader();
                reader.onload = (e) => {
                    selectedFileData = { url: e.target.result, name: file.name, type: file.type };
                    filePreviewName.textContent = file.name;
                    filePreviewBar.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });

        removeFileBtn.addEventListener('click', () => {
            selectedFileData = null;
            chatFileInput.value = '';
            filePreviewBar.style.display = 'none';
        });

        // Live Location Action
        locationBtn.addEventListener('click', () => {
            if (!activeRecipientSocketId) return;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    socket.emit('private message', {
                        recipientSocketId: activeRecipientSocketId,
                        message: '📍 Shared Live Location',
                        location: { lat: position.coords.latitude, lng: position.coords.longitude }
                    });
                }, (err) => alert('Unable to fetch location: ' + err.message));
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });

        // KBC Audience Poll Modal Handlers
        kbcBtn.addEventListener('click', () => {
            if (!activeRecipientSocketId) return;
            kbcModal.style.display = 'flex';
        });

        closeKbcBtn.addEventListener('click', () => kbcModal.style.display = 'none');

        sendKbcPollBtn.addEventListener('click', () => {
            const question = document.getElementById('kbc-q').value.trim();
            const opt1 = document.getElementById('kbc-opt1').value.trim();
            const opt2 = document.getElementById('kbc-opt2').value.trim();
            const opt3 = document.getElementById('kbc-opt3').value.trim();
            const opt4 = document.getElementById('kbc-opt4').value.trim();
            const correctIndex = parseInt(document.getElementById('kbc-correct').value);

            if (!question || !opt1 || !opt2 || !opt3 || !opt4) {
                alert('Please fill out all KBC poll fields.');
                return;
            }

            socket.emit('private message', {
                recipientSocketId: activeRecipientSocketId,
                kbcPoll: {
                    question,
                    options: [opt1, opt2, opt3, opt4],
                    correctOptionIndex: correctIndex
                }
            });

            // Reset Form & Close
            document.getElementById('kbc-q').value = '';
            document.getElementById('kbc-opt1').value = '';
            document.getElementById('kbc-opt2').value = '';
            document.getElementById('kbc-opt3').value = '';
            document.getElementById('kbc-opt4').value = '';
            kbcModal.style.display = 'none';
        });

        function setAvatarElement(element, username, profilePic) {
            if (profilePic) {
                element.innerHTML = `<img src="${profilePic}" alt="${escapeHTML(username)}">`;
            } else {
                element.textContent = username ? username.charAt(0).toUpperCase() : '?';
            }
        }

        authSubmitBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const username = document.getElementById('username').value.trim();

            const endpoint = isLoginMode ? '/api/login' : '/api/register';
            const bodyData = isLoginMode ? { email, password } : { username, email, password, profilePic: profilePicBase64 };

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Authentication failed');

                localStorage.setItem('chat_token', data.token);
                currentUser = data.user;
                initSocket(data.token);

            } catch (err) {
                errorMsg.textContent = err.message;
                errorMsg.style.display = 'block';
            }
        });

        function initSocket(token) {
            socket = io({ auth: { token } });

            socket.on('connect', () => {
                authScreen.style.display = 'none';
                chatScreen.style.display = 'flex';
                myProfile.textContent = currentUser.username;
                setAvatarElement(myAvatar, currentUser.username, currentUser.profilePic);
                socket.emit('get statuses');
            });

            socket.on('connect_error', (err) => {
                errorMsg.textContent = err.message;
                errorMsg.style.display = 'block';
                localStorage.removeItem('chat_token');
            });

            socket.on('update userlist', (users) => {
                userList.innerHTML = '';
                users.forEach(u => {
                    if (u.socketId === socket.id) return;

                    if (!conversationHistory[u.socketId]) {
                        conversationHistory[u.socketId] = [];
                    }

                    const li = document.createElement('li');
                    li.dataset.socketId = u.socketId;

                    const avatarHTML = u.profilePic 
                        ? `<img src="${u.profilePic}" alt="User">` 
                        : u.username.charAt(0).toUpperCase();

                    li.innerHTML = `
                        <div class="avatar">${avatarHTML}</div>
                        <div class="contact-info">
                            <div class="contact-name">${escapeHTML(u.username)}</div>
                            <div class="contact-status">online</div>
                        </div>
                    `;

                    if (u.socketId === activeRecipientSocketId) {
                        li.classList.add('active');
                    }

                    li.addEventListener('click', () => selectUser(u.socketId, u.username, u.profilePic));
                    userList.appendChild(li);
                });

                if (activeRecipientSocketId && !users.find(u => u.socketId === activeRecipientSocketId)) {
                    headerTitle.textContent = 'User went offline';
                    headerAvatar.style.display = 'none';
                    videoCallBtn.style.display = 'none';
                    activeChatContainer.style.display = 'none';
                    noChatSelected.style.display = 'flex';
                    activeRecipientSocketId = null;
                }
            });

            socket.on('private message', (data) => {
                const partnerSocketId = data.senderSocketId === socket.id ? data.recipientSocketId : data.senderSocketId;

                if (!conversationHistory[partnerSocketId]) {
                    conversationHistory[partnerSocketId] = [];
                }

                conversationHistory[partnerSocketId].push(data);

                if (partnerSocketId === activeRecipientSocketId) {
                    renderMessages();
                }
            });

            socket.on('kbc vote update', ({ pollId, pollData, voterUserId, selectedOptionIndex }) => {
                // Find and update the local poll object in history
                Object.keys(conversationHistory).forEach(partnerId => {
                    conversationHistory[partnerId].forEach(msg => {
                        if (msg.kbcPoll && msg.kbcPoll.id === pollId) {
                            msg.kbcPoll = pollData;
                        }
                    });
                });

                if (activeRecipientSocketId) {
                    renderMessages();
                }
            });

            socket.on('typing', (data) => {
                if (data.senderSocketId === activeRecipientSocketId) {
                    typingIndicator.textContent = data.isTyping ? 'typing...' : '';
                }
            });

            socket.on('update status list', (statuses) => {
                statusList.innerHTML = '';
                statuses.forEach(s => {
                    const item = document.createElement('div');
                    item.className = 'status-item';

                    const ring = document.createElement('div');
                    ring.className = 'status-ring';

                    const avatar = document.createElement('div');
                    avatar.className = 'avatar';
                    
                    const avatarPic = s.userId && s.userId.profilePic ? s.userId.profilePic : s.mediaUrl;
                    avatar.innerHTML = `<img src="${avatarPic}" alt="Status" />`;

                    ring.appendChild(avatar);
                    item.appendChild(ring);

                    const name = document.createElement('div');
                    name.className = 'status-username';
                    name.textContent = s.username;
                    item.appendChild(name);

                    item.addEventListener('click', () => {
                        statusViewerImg.src = s.mediaUrl;
                        statusViewerCaption.textContent = s.caption || '';
                        statusModal.style.display = 'flex';
                    });

                    statusList.appendChild(item);
                });
            });

            socket.on('incoming-call', ({ from, callerName, offer }) => {
                incomingCallerSocketId = from;
                incomingOffer = offer;
                callerNameSpan.textContent = callerName;
                incomingCallBox.style.display = 'flex';
            });

            socket.on('call-accepted', async ({ answer }) => {
                if (peerConnection) {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                }
            });

            socket.on('ice-candidate', async ({ candidate }) => {
                if (peerConnection && candidate) {
                    try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error('Error adding ICE candidate', e);
                    }
                }
            });

            socket.on('call-ended', () => {
                closeVideoCall();
            });
        }

        statusFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) return alert("Status file limit is 10MB");
                const reader = new FileReader();
                reader.onload = function(e) {
                    const caption = prompt("Enter status caption (optional):") || '';
                    socket.emit('upload status', { mediaUrl: e.target.result, caption });
                    statusFileInput.value = '';
                };
                reader.readAsDataURL(file);
            }
        });

        closeStatusBtn.addEventListener('click', () => statusModal.style.display = 'none');

        function selectUser(targetSocketId, username, profilePic) {
            activeRecipientSocketId = targetSocketId;
            headerTitle.textContent = username;
            setAvatarElement(headerAvatar, username, profilePic);
            headerAvatar.style.display = 'flex';
            videoCallBtn.style.display = 'block';

            document.querySelectorAll('#user-list li').forEach(li => {
                li.classList.toggle('active', li.dataset.socketId === targetSocketId);
            });

            noChatSelected.style.display = 'none';
            activeChatContainer.style.display = 'flex';
            chatScreen.classList.add('show-chat');

            renderMessages();
            messageInput.focus();
        }

        backBtn.addEventListener('click', () => chatScreen.classList.remove('show-chat'));

        function renderMessages() {
            messagesDiv.innerHTML = '';
            const history = conversationHistory[activeRecipientSocketId] || [];

            history.forEach((data, index) => {
                const isSent = data.senderSocketId === socket.id;
                const msgDiv = document.createElement('div');
                msgDiv.className = `message ${isSent ? 'sent' : 'received'}`;

                let contentHTML = '';

                // Attachment
                if (data.file) {
                    if (data.file.type.startsWith('image/')) {
                        contentHTML += `<a href="${data.file.url}" target="_blank"><img src="${data.file.url}" class="chat-image" alt="Uploaded image" /></a>`;
                    } else {
                        contentHTML += `<a href="${data.file.url}" download="${escapeHTML(data.file.name)}" class="chat-file-link">📄 ${escapeHTML(data.file.name)}</a>`;
                    }
                }

                // Map Location
                if (data.location) {
                    const mapId = `map-${index}`;
                    contentHTML += `
                        <div>📍 Live Location</div>
                        <div id="${mapId}" class="map-card"></div>
                        <a href="https://www.google.com/maps?q=${data.location.lat},${data.location.lng}" target="_blank" class="location-btn-link">Open in Google Maps ↗</a>
                    `;
                }

                // KBC Audience Call Poll Rendering
                if (data.kbcPoll) {
                    const poll = data.kbcPoll;
                    const userVotedIndex = poll.votedUsers[currentUser.id];
                    const hasVoted = userVotedIndex !== undefined;

                    contentHTML += `
                        <div class="kbc-card">
                            <div class="kbc-header">📊 KBC AUDIENCE CALL</div>
                            <div class="kbc-question">${escapeHTML(poll.question)}</div>
                            <div class="kbc-options">
                    `;

                    poll.options.forEach((opt, optIdx) => {
                        const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        let btnClass = 'kbc-option-btn';

                        if (hasVoted) {
                            if (optIdx === poll.correctOptionIndex) {
                                btnClass += ' correct';
                            } else if (optIdx === userVotedIndex) {
                                btnClass += ' wrong';
                            }
                        }

                        const optionLabels = ['A', 'B', 'C', 'D'];

                        contentHTML += `
                            <button class="${btnClass}" onclick="voteKbcOption('${poll.id}', ${optIdx})" ${hasVoted ? 'disabled' : ''}>
                                <div class="kbc-bar-fill" style="width: ${hasVoted ? percent : 0}%"></div>
                                <span class="kbc-option-text">${optionLabels[optIdx]}: ${escapeHTML(opt.text)}</span>
                                ${hasVoted ? `<span class="kbc-percent">${percent}%</span>` : ''}
                            </button>
                        `;
                    });

                    contentHTML += `</div></div>`;
                }

                if (data.message && !data.location) {
                    contentHTML += `<div>${escapeHTML(data.message)}</div>`;
                }

                contentHTML += `<span class="time">${data.time}</span>`;

                msgDiv.innerHTML = contentHTML;
                messagesDiv.appendChild(msgDiv);

                // Leaflet Map Init
                if (data.location) {
                    setTimeout(() => {
                        const map = L.map(`map-${index}`, { zoomControl: false, attributionControl: false }).setView([data.location.lat, data.location.lng], 15);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        L.marker([data.location.lat, data.location.lng]).addTo(map);
                    }, 50);
                }
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        window.voteKbcOption = function(pollId, optionIndex) {
            if (!activeRecipientSocketId) return;
            socket.emit('kbc vote', {
                pollId,
                optionIndex,
                recipientSocketId: activeRecipientSocketId
            });
        };

        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = messageInput.value.trim();

            if ((msg || selectedFileData) && activeRecipientSocketId) {
                socket.emit('private message', {
                    recipientSocketId: activeRecipientSocketId,
                    message: msg,
                    file: selectedFileData
                });

                messageInput.value = '';
                selectedFileData = null;
                chatFileInput.value = '';
                filePreviewBar.style.display = 'none';
                emojiPickerContainer.style.display = 'none';

                socket.emit('typing', { recipientSocketId: activeRecipientSocketId, isTyping: false });
            }
        });

        messageInput.addEventListener('input', () => {
            if (activeRecipientSocketId) {
                socket.emit('typing', { recipientSocketId: activeRecipientSocketId, isTyping: true });
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    socket.emit('typing', { recipientSocketId: activeRecipientSocketId, isTyping: false });
                }, 1000);
            }
        });

        // WebRTC Functions
        async function setupMediaStream() {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localVideo.srcObject = localStream;
                peerConnection = new RTCPeerConnection(rtcConfig);

                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
                peerConnection.ontrack = (event) => remoteVideo.srcObject = event.streams[0];
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        const targetSocketId = activeRecipientSocketId || incomingCallerSocketId;
                        socket.emit('ice-candidate', { to: targetSocketId, candidate: event.candidate });
                    }
                };
            } catch (err) {
                alert('Could not access camera/microphone: ' + err.message);
                throw err;
            }
        }

        videoCallBtn.addEventListener('click', async () => {
            if (!activeRecipientSocketId) return;
            videoCallModal.style.display = 'flex';
            await setupMediaStream();
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('call-user', { to: activeRecipientSocketId, offer });
        });

        acceptCallBtn.addEventListener('click', async () => {
            incomingCallBox.style.display = 'none';
            videoCallModal.style.display = 'flex';
            await setupMediaStream();
            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingOffer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('make-answer', { to: incomingCallerSocketId, answer });
        });

        rejectCallBtn.addEventListener('click', () => {
            incomingCallBox.style.display = 'none';
            socket.emit('end-call', { to: incomingCallerSocketId });
            incomingCallerSocketId = null;
            incomingOffer = null;
        });

        hangupCallBtn.addEventListener('click', () => {
            const targetSocketId = activeRecipientSocketId || incomingCallerSocketId;
            if (targetSocketId) socket.emit('end-call', { to: targetSocketId });
            closeVideoCall();
        });

        function closeVideoCall() {
            videoCallModal.style.display = 'none';
            incomingCallBox.style.display = 'none';
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            localVideo.srcObject = null;
            remoteVideo.srcObject = null;
            incomingCallerSocketId = null;
            incomingOffer = null;
        }

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('chat_token');
            location.reload();
        });

        function escapeHTML(str) {
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
            }[tag] || tag));
        }
    </script>
</body>
</html>
