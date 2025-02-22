import React, { useEffect, useState, useRef  } from 'react';
import './imagedashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';

function ImageDashboard() {
    const [selectedDiv, setSelectedDiv] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [characters, setCharacters] = useState([]);
    const { characterId } = location.state || {};
    const imageinputRef = useRef(null);
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const idToken = await AsyncStorage.getItem('idToken');
                const response = await fetch(`http://app-lb-2028084851.us-east-1.elb.amazonaws.com/character_image/${characterId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setImages(data);
                } else {
                    throw new Error('Failed to fetch images');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching images');
            }
        };

        fetchImages();
    }, [characterId]);

    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            alert('Please select an image');
            return;
        }
        setIsLoading(true);
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch(`http://app-lb-2028084851.us-east-1.elb.amazonaws.com/character_image/${characterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ profile_pic: selectedImage })
            });

            if (response.ok) {
                alert('Profile picture updated successfully');
                navigate('/chatdashboard', { state: { characterId } } ); 
            } else {
                throw new Error('Failed to update profile picture');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating profile picture');
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

    useEffect(() => {
        if (selectedDiv === 'chat-history') {
            fetchCharacters();
        }
    }, [selectedDiv]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const response = await fetch(`http://app-lb-2028084851.us-east-1.elb.amazonaws.com/character_image/${characterId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData
            });
    
            if (response.ok) {
                alert('Image uploaded successfully');
                navigate('/chatdashboard', { state: { characterId } } );
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }
    };


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
                {isLoading ? (
                    <div className="loading-indicator">
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {images.length > 0 ? (
                            <div className="image-grid">
                                {images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`image-item ${selectedImage === image ? 'selected' : ''}`} 
                                        onClick={() => handleImageSelect(image)}
                                    >
                                        <img src={image} alt={`Character ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No images available</p>
                        )}
                        <button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Selected Image'}
                        </button>
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            ref={imageinputRef}
                            onChange={handleImageUpload}
                        />
                        <button onClick={() => imageinputRef.current && imageinputRef.current.click()} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Browse Image'}
                        </button>

                    </>
                )}
            </div>
        </div>
    );
}

export default ImageDashboard;
