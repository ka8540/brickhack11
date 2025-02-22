import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, updatePassword} from '@aws-amplify/auth';

const Profile = () => {
    const [selectedDiv, setSelectedDiv] = useState('profile');
    const [profileData, setProfileData] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const[backgroundPicUrl, setBackgroundPicUrl] = useState('');
    const [characters, setCharacters] = useState([]);
    const navigate = useNavigate();
    const backgroundInputRef = useRef(null);
    const profileInputRef = useRef(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const profile = data[0];
                    setProfileData({
                        name: profile[0],
                        email: profile[1],
                        phone_number: profile[2]
                    });
                } else {
                    throw new Error('Failed to fetch profile');
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchProfile();
    }, []);

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

    useEffect(() => {
        if (selectedDiv === 'chat-history') {
            fetchCharacters();
        }
    }, [selectedDiv]);

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

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/upload_image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Image uploaded successfully');
                fetchProfilePic();  // Refresh the profile picture
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }
    };

    useEffect(() => {
        fetchProfilePic();
        fetchBackgroundPic(); 
    }, []);

    const handleBackgroundImageUpload = async (event) =>{
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/background_image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Background Image uploaded successfully'); 
                fetchBackgroundPic();
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }

    };

    const fetchBackgroundPic = async () => {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/background_image', {  
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setBackgroundPicUrl(data[0]);
            } else {
                console.error('Failed to fetch profile picture');
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
    
        const passwordData = {
            oldPassword: oldPassword,
            newPassword: newPassword
        };
    
        try {
            await updatePassword(passwordData);
            setSuccess(true);
            setError('');
        } catch (error) {
            setError('Password update failed: ' + error.message);
            setSuccess(false);
            console.error('Error updating password:', error);
        }
    };
    



    return (
        <div className="profile-container">
            <div className='profile-sidebar'>
            <h1 className='p-name'>PersonaCraft</h1>
            <div
                className={`c-home ${selectedDiv === 'home' ? 'selected' : ''}`}
                onClick={() => handleDivClick('home', '/characterpage')}
                >
                <span className="material-symbols-outlined">
                    home
                </span>
                Home
                </div>

                <div
                className={`c-profile ${selectedDiv === 'profile' ? 'selected' : ''}`}
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
                className={`c-signout ${selectedDiv === 'signout' ? 'selected' : ''}`}
                onClick={handleSignOut}
                >
                <span className="material-symbols-outlined">
                    logout
                </span>
                Signout
                </div>
            </div>
            <div 
                className='profile-header'
                style={{
                    backgroundImage: backgroundPicUrl ? `url(${backgroundPicUrl})` : 'none',
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat'
                }}
                
            >
                <div className='profile-pic-background' >
                    
                    <input
                            type="file"
                            style={{ display: 'none' }}
                            ref={backgroundInputRef}
                            onChange={handleBackgroundImageUpload}
                        />
                       
                    <input
                            type="file"
                            style={{ display: 'none' }}
                            ref={profileInputRef}
                            onChange={handleImageUpload}
                        />
                         
                        {profileData && <h1 className='name'>{profileData.name}</h1>}
                </div>
            </div>
            <div className='profile-pic-div' >
                        <div className='profile-pic-inner-div' onClick={() => profileInputRef.current.click()}>
                            {profilePicUrl && <img src={profilePicUrl} alt="Profile" />}
                        </div>
                    </div>

            <button  className='input-button' 
            onClick={() => backgroundInputRef.current.click()}
            >
                    Edit
            </button>  

            <div className='profile-details'>
            <h3 className='details-heading'>Profile Details</h3>  
            <div className='contacts'>
              Contacts
            </div>
            <div className='mobile-number'>
            <span class="material-symbols-outlined">
                call
            </span>
            {profileData && <p className='phoneNumber'>{profileData.phone_number}</p>}
            </div>
            <div className='email'>
            <span className="material-symbols-outlined">
                email
            </span>
            {profileData && <p className='phoneNumber'>{profileData.email}</p>}
            </div>
            </div>   

            <div className='change-password'>
            <form onSubmit={handleChangePassword} className='changepassword-form'>
                <p className='password-heading'>Change Password</p>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Current Password"
                    required
                    className='input-1'
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    className='input-2'
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    className='input-3'
                />
                <button type="submit">Change Password</button>
                {error && <p style={{ color: 'red', marginLeft: '200px' }}>{error}</p>}
                {success && <p style={{ color: 'green' , marginLeft: '200px'}}>Password changed successfully!</p>}
            </form>
        </div>  
        </div>
    );
};

export default Profile;
