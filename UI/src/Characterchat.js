import React, { useState, useEffect } from 'react';
import './chatdashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function CharacterChat() {
    const [selectedDiv, setSelectedDiv] = useState(null);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [profilePic, setProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedCharacterId, setFetchedCharacterId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [characters, setCharacters] = useState([]);
    const { characterName } = location.state || {};
    const [profilePicUrl, setProfilePicUrl] = useState('');

    useEffect(() => {
        const fetchProfilePic = async (characterId) => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch(`http://app-lb-2028084851.us-east-1.elb.amazonaws.com/profile_pic/${characterId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    let profilePicUrl = data[0];
        
                    if (typeof profilePicUrl === 'string' && profilePicUrl.startsWith("['") && profilePicUrl.endsWith("']")) {
                        profilePicUrl = profilePicUrl.slice(2, -2); 
                    }
        
                    console.log("Profile Picture URL:", profilePicUrl);
                    setProfilePic(profilePicUrl);
                } else {
                    throw new Error('Failed to fetch profile picture');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching profile picture');
            }
        };

        const fetchChatHistory = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch(`http://app-lb-2028084851.us-east-1.elb.amazonaws.com/stored_chat?character_name=${characterName}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.chat_logs.length > 0) {
                        setFetchedCharacterId(data.chat_logs[0].character_id);
                        setChatHistory(data.chat_logs);
                        fetchProfilePic(data.chat_logs[0].character_id);
                    }
                } else {
                    throw new Error('Failed to fetch chat history');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching chat history');
            }
        };

        

        if (characterName) {
            fetchChatHistory();
        }
    }, [characterName]);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }
        setChatHistory(prevHistory => [...prevHistory, { sender: 'user', message }]);
        setMessage(''); // Clear the input field
        setIsLoading(true);
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/chat_with_character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ character_id: fetchedCharacterId, message })
            });

            if (response.ok) {
                const data = await response.json();
                setChatHistory(prevHistory => [
                    ...prevHistory,
                    { sender: 'character', message: data.response }
                ]);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login'); 
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out');
        }
    };

    const handleDivClick = (characterName, navigateTo, characterId) => {
        setSelectedDiv(characterName); 
        navigate(navigateTo, { state: { characterId, characterName } });
    };

    const toggleDropdown = (menu) => {
        if (selectedDiv === menu) {
            setSelectedDiv(''); 
        } else {
            setSelectedDiv(menu); 
        }
    } 

    const fetchCharacters = async () => {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            console.log("Token in Page:", idToken);
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/getchacters', { 
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCharacters(data.characters || []);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching characters:', error);
        }
    };

    const fetchProfilePic = async () => {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/upload_image', {  
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setProfilePicUrl(data[0]);
            } else {
                console.error('Failed to fetch profile picture');
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    };

    useEffect(() => {
        if (selectedDiv === 'chat-history') {
            fetchCharacters();
        }
        fetchProfilePic();
    }, [selectedDiv]);

    return (
        <div className="container">
            <div className='characters-sidebar'>
            <h1 className='pages-name'>PersonaCraft</h1>
            <div
            className={`characters-home ${selectedDiv === 'home' ? 'selected' : ''}`}
            onClick={() => handleDivClick('home', '/characterpage')}
            >
            <span className="material-symbols-outlined">
                home
            </span>
            Home
            </div>

            <div
            className={`characters-profile ${selectedDiv === 'profile' ? 'selected' : ''}`}
            onClick={() => handleDivClick('profile', '/profile')}
            >
            <span className="material-symbols-outlined">
                account_circle
            </span>
            Profile
            </div>

            <div className='dropdown'>
             <div
            className={`dropdown-header ${selectedDiv === 'chat-history' ? 'selected' : ''}`}
            onClick={() => toggleDropdown('chat-history')}
        >
            <span className="material-symbols-outlined">
                forum
            </span>
            History
                </div>
                {selectedDiv === 'chat-history' && (
                    <div className='dropdown-content'>
                        {characters.map((char, index) => (
                            <div key={index} onClick={() => handleDivClick(char.character_name, '/characterchat', char.character_id)}>{char.character_name}</div>
                        ))}
                        <div onClick={() => handleDivClick('+ New', '/dashboard')}>
                        <span class="material-symbols-outlined">
                            add
                            </span>
                            New</div>
                    </div>
                )}
            </div>

            <div
            className={`characters-signout ${selectedDiv === 'signout' ? 'selected' : ''}`}
            onClick={handleSignOut}
            >
            <span className="material-symbols-outlined">
                logout
            </span>
            Signout
            </div>
        </div>

            <div className="character-creation-form">
                <div className="chat-container">
                    <div className="chat-history">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`chat-message ${chat.sender}`}>
                                {chat.sender === 'character' ? (
                                    profilePic ? (
                                        <>
                                            <img src={profilePic} alt="Character" className="profile-pic" />
                                            <p>{chat.message}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="profile-initials">R</div>
                                            <p>{chat.message}</p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p>{chat.message}</p>
                                        {profilePicUrl ? (
                                                <img src={profilePicUrl} alt="Me" className="profile-pic" />
                                            ) : (
                                                <div className="profile-initials">M</div>
                                            )}
                                    </>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message character">
                                <div className="profile-initials">R</div>
                                <p>...</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="chat-input-form">
                        <input
                            type="text"
                            value={message}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle className="path" cx="12" cy="12" r="10" stroke="#007bff" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CharacterChat;
