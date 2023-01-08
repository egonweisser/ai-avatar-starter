import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
 // Don't retry more than 20 times
 const maxRetries = 20;
 const [input, setInput] = useState('');
 const [img, setImg] = useState('');
 // Numbers of retries 
 const [retry, setRetry] = useState(0);
 // Number of retries left
 const [retryCount, setRetryCount] = useState(maxRetries);
 // rest of code
 // Add isGenerating state
const [isGenerating, setIsGenerating] = useState(false);
// Add new state here
const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value);
  };


  const generateAction = async () => {

    console.log('Generating...');	

      // Add this check to make sure there is no double click
  if (isGenerating && retry === 0) return;

  // Set loading has started
  setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

  // delete raza
    const finalInput = input.replace(/raza/gi, 'abraza');

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input: finalInput }),
    });


  const data = await response.json();

  // If model still loading, drop that retry time
  if (response.status === 503) {
    console.log('Model is loading still :(.');
    // Set the estimated_time property in state
    setRetry(data.estimated_time);
    return;
  }

  // If another error, drop error
  if (!response.ok) {
    console.log(`Error: ${data.error}`);
    // Stop loading
    setIsGenerating(false);
    return;
  }
   // Set final prompt here
   setFinalPrompt(input);
   // Remove content from input box
   setInput('');
  // Set image data into state property
  setImg(data.image);
   // Everything is all done -- stop loading!
   setIsGenerating(false);
  
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// Add useEffect here
useEffect(() => {
const runRetry = async () => {
if (retryCount === 0) {
  console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
  setRetryCount(maxRetries);
  return;
  }

console.log(`Trying again in ${retry} seconds.`);

await sleep(retry * 1000);

await generateAction();
};

if (retry === 0) {
return;
}

runRetry();
}, [retry]);


  return (
    <div className="root">
      <Head>
        <title>AI customised Emma | egg</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>AI customised Emma Watson</h1>
          </div>
          <div className="header-subtitle">
            <h2>I customised SD to return a younger/sexier version of Emma! type in the prompt "customemma" + whatever.</h2>
          </div>
            {/* Add prompt container here */}
        <div className="prompt-container">
        <input className="prompt-box" value={input} onChange={onChange} />
  <div className="prompt-buttons">
    {/* Tweak classNames to change classes */}
    <a
      className={
        isGenerating ? 'generate-button loading' : 'generate-button'
      }
      onClick={generateAction}
    >
      {/* Tweak to show a loading indicator */}
      <div className="generate">
        {isGenerating ? (
          <span className="loader"></span>
        ) : (
          <p>Generate</p>
        )}
      </div>
    </a>
  </div>
        </div>
        </div>
         {/* Add output container */}
    {img && (
      <div className="output-content">
        <Image src={img} width={512} height={512} alt={finalPrompt} />
         {/* Add prompt here */}
        <p>{finalPrompt}</p>
      </div>
    )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/@egon"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>by egg</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
