import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from '@aws-amplify/auth';
function Dashboard() {
    const [selectedDiv, setSelectedDiv] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [formData, setFormData] = useState({
        gender: 'male',
        personalityTraits: '',
        name: '',
        backgroundStory: '',
        ageRange: '',
        occupation: '',
        skills: '',
        hobbies: '',
        physicalCharacteristics: '',
        relationshipDynamics: '',
        personalGoals: '',
        strengthsWeaknesses: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); 
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            console.log(idToken);
            const response = await fetch('http://app-lb-2028084851.us-east-1.elb.amazonaws.com/create_character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {  
                const data = await response.json();
                const characterId = data.character_id[0]; 
                navigate('/imagedashboard', { state: { characterId } });
            } else {
                throw new Error('Failed to create character');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating character'); 
        } finally {
            setIsLoading(false); 
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
            <form className="character-creation-form" onSubmit={handleSubmit}>
                <label>
                    Would you prefer the character to be male, female, or have an option for non-binary or other genders?
                    <select name="gender">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </label>
                <label>
                    What kind of personality traits would you like your character to have? (e.g., humorous, serious, kind, adventurous)
                    <input type="text" name="personalityTraits" onChange={handleInputChange} placeholder="e.g., humorous, serious" />
                </label>
                <label>
                    Can you provide an example of a name you would like for your character?
                    <input type="text" name="name" onChange={handleInputChange} placeholder="Character's name" />
                </label>
                <label>
                    What is the background story of your character? Please provide details such as their origin, significant life events, and any key relationships.
                    <textarea name="backgroundStory" onChange={handleInputChange} placeholder="Character's backstory"></textarea>
                </label>
                <label>
                    What age range should your character fall into? (e.g., child, teenager, adult, elderly)
                    <input type="text" name="ageRange" onChange={handleInputChange} placeholder="e.g., child, teenager, adult" />
                </label>
                <label>
                    What kind of occupation or role would you like your character to have? (e.g., detective, teacher, superhero)
                    <input type="text" name="occupation" onChange={handleInputChange} placeholder="Character's occupation" />
                </label>
                <label>
                    Does your character have any specific skills or abilities? If so, please describe them.
                    <input type="text" name="skills" onChange={handleInputChange} placeholder="Character's skills" />
                </label>
                <label>
                    What hobbies or interests does your character have? (e.g., playing the guitar, painting, hiking)
                    <input type="text" name="hobbies" onChange={handleInputChange} placeholder="Character's hobbies" />
                </label>
                <label>
                    Are there any physical characteristics or distinctive features you want your character to have? (e.g., height, hair color, eye color, scars, tattoos)
                    <input type="text" name="physicalCharacteristics" onChange={handleInputChange} placeholder="e.g., height, hair color" />
                </label>
                <label>
                    What kind of relationship dynamics would you like your character to have with other characters? (e.g., friendly, competitive, mentor-student)
                    <input type="text" name="relationshipDynamics" onChange={handleInputChange} placeholder="e.g., friendly, competitive" />
                </label>
                <label>
                    Does your character have any personal goals or aspirations? If so, what are they?
                    <input type="text" name="personalGoals" onChange={handleInputChange} placeholder="Character's goals" />
                </label>
                <label>
                    Would you like your character to have any particular strengths or weaknesses? Please provide details.
                    <input type="text" name="strengthsWeaknesses" onChange={handleInputChange} placeholder="Character's strengths/weaknesses" />
                </label>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Character'}
                </button>
            </form>
        </div>
    );
}

export default Dashboard;
