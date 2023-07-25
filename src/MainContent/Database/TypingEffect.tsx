import React, { useEffect } from 'react';

const typingSpeed = 20; // speed in milliseconds
const deletingSpeed = 20; // speed in milliseconds
const pauseTime = 2000; // pause time between phrases in milliseconds

const phrases = [
    "Use natural language or a MongoDB query...", 
    "find all where phone_number contains 510", 
    `find({ "phone_number": { $regex: '510' } })`, 
    "update every user without an email with a new field is_anonymous: true", 
    `updateMany({ "email": { "$exists": false } }, { "$set": { "is_anonymous": true } })`,
    "delete every user where state is CA", 
    `deleteMany({ "state": "CA" })`];

const useTypingEffect = (setSearchPlaceholder: React.Dispatch<React.SetStateAction<string>>) => {
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  useEffect(() => {
    const typePhrase = () => {
      if (charIndex === phrases[phraseIndex].length + 1 && !isDeleting) {
        setTimeout(() => { isDeleting = true; }, pauseTime);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      } 

      const typingTimeout = setTimeout(() => {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
          setSearchPlaceholder(currentPhrase.slice(0, charIndex - 1));
          charIndex--;
        } else {
          setSearchPlaceholder(currentPhrase.slice(0, charIndex + 1));
          charIndex++;
        }

        typePhrase();
      }, isDeleting ? deletingSpeed : typingSpeed);

      // cleanup function to clear the timeout when the component unmounts
      return () => clearTimeout(typingTimeout);
    };

    typePhrase();
  }, []); // empty dependency array to run effect only once on mount

};

export default useTypingEffect;

