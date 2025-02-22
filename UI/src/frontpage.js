import React from 'react';
import './frontpage.css';
import { useNavigate } from 'react-router-dom';

const FrontPage = () => {
    const navigate = useNavigate(); 
  return (
    <div className="front-page">
      <header className="front-page-header">
        <h1 className="title-2">PersonaCraft</h1>
      </header>
      <main className="front-page-main">
      <h3 className="welcome-sign">Welcome to the Fictional Character Chat App!</h3>
        <div className="main-div">
          <div className="para-1">
            <p>Have you ever dreamed of creating a character that feels as real as a friend? With our Fictional Character Chat App, you can craft a unique persona, complete with a rich background and distinct personality traits. Whether it's a brave adventurer, a wise mentor, or a quirky sidekick, the possibilities are endless.</p>
          </div>
          <img src="https://profile-picture-docs.s3.amazonaws.com/sun-Photoroom.png" alt="Descriptive Text" className='image-size'/>
          <div className="para-2">
            <p>Our app allows you to develop a character that not only entertains but also provides companionship. Engage in conversations that reflect the personality you've crafted, making each interaction feel genuine and heartfelt. This isn't just a character; it's a friend who understands and responds to you.</p>
          </div>
          <div className="para-1">
            <p>Start with a few basic details, and watch as your character comes to life with multiple image options to choose from. Customize their traits and story, and even evolve their personality as your relationship grows. It's like having a best friend who adapts and grows with you.</p>
          </div>
          <img src="https://profile-picture-docs.s3.amazonaws.com/Gojo-Photoroom.png" alt="Descriptive Text" className='image-size-2'/>
          <div className="para-2">
            <p>Explore the art of storytelling in a whole new way. Use your character to inspire your creative writing, or simply enjoy the fun of interacting with a persona you've brought to life. It's a perfect blend of creativity and companionship.</p>
          </div>
          <div className="para-1">
            <p>Our app provides a safe and secure environment where you can express yourself freely. Your conversations are private and stored securely, ensuring that your creative journey remains personal and protected.</p>
          </div>
          <img src="https://profile-picture-docs.s3.amazonaws.com/soma.webp" alt="Descriptive Text" className='giphy-embed-3'/>
          <img src="https://profile-picture-docs.s3.amazonaws.com/sukuna.webp" alt="Descriptive Text" className='giphy-embed'/>  
          <img src="https://profile-picture-docs.s3.amazonaws.com/Yato-Photoroom.png" alt="Descriptive Text" className='image-size-3'/>
          <div className="para-2">
            <p>The Fictional Character Chat App is more than just a tool—it's a gateway to new worlds and friendships. Dive into your imagination and create characters that bring joy, wisdom, and adventure into your life. Start your journey today and see where your creativity takes you!</p>
          </div>
          <img src="https://profile-picture-docs.s3.amazonaws.com/gameplay2.webp" alt="Descriptive Text" className='giphy-embed-2'/>
        </div>
        <div>
            <button className="join-us-button" onClick={() => navigate('/login')}>Let's Chat</button>
        </div>
      </main>
      <footer className="front-page-footer">
        <p>© 2024 PersonaCraft </p>
        <p className='by-line'>by Kush Jayesh Ahir</p>
      </footer>
    </div>
  );
};

export default FrontPage;
