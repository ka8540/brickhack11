import React, { useState, useEffect } from 'react';
import './characterpage.css';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

function CharacterPage() {
  const [selectedDiv, setSelectedDiv] = useState('home');
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const idToken = await AsyncStorage.getItem('idToken');
        console.log("TOken in Page:",idToken);
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

    fetchCharacters();
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

  const handleDivClick = (divName, navigateTo) => {
    setSelectedDiv(divName);
    navigate(navigateTo);
  };

  return (
    <div className='character-container'>
      <div className='character-sidebar'>
        <h1 className='page-name'>PersonaCraft</h1>
        <div
          className={`character-home ${selectedDiv === 'home' ? 'selected' : ''}`}
          onClick={() => handleDivClick('home', '/characterpage')}
        >
          <span className="material-symbols-outlined">
            home
          </span>
          Home
        </div>

        <div
          className={`character-profile ${selectedDiv === 'profile' ? 'selected' : ''}`}
          onClick={() => handleDivClick('profile', '/profile')}
        >
          <span className="material-symbols-outlined">
            account_circle
          </span>
          Profile
        </div>

        <div
          className={`character-signout ${selectedDiv === 'signout' ? 'selected' : ''}`}
          onClick={handleSignOut}
        >
          <span className="material-symbols-outlined">
            logout
          </span>
          Signout
        </div>
      </div>
      <div className='mainComponent'>
        <div className='cool-line'>Imagine, Create, Connect</div>
        <div className='chat-dashboard'>
          <h4 className='chat-headingtext'>Unleash your imagination and create a friend who understands you like no one else</h4>
          {characters.length === 0 ? (
              <div className='chat-dashboard-comp-2' onClick={() => navigate('/dashboard')}>Create new character +</div>
            ) : (
              <>
                <div className='flex-comp'>
                  {characters.map((character, index) => (
                    <div key={index} className='chat-dashboard-comp' onClick={() => navigate('/characterchat', { state: { characterId: character.character_id, characterName: character.character_name } })}>
                    {character.character_name}
                  </div>
                  ))}
                  <div className='chat-dashboard-comp create-new' onClick={() => navigate('/dashboard')}>
                    Create new character +
                  </div>  
                </div>
              </>

            )}

        </div>
      </div>
    </div>
  );
}

export default CharacterPage;
