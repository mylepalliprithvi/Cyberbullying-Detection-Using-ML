import { useState } from 'react'
import './App.css'
import axios from "axios";
function App() {
  const [tweet,setTweet] = useState('');
  const [user1,setUser1] = useState('');
  const [user2,setUser2] = useState('');
  const [result,setResult] = useState('');

  const handleSubmit = async() => {
    if(!tweet || !user1 || !user2)
      {
        alert("Please Fill in the details");
        return;
      }

      try{
        const relationshipResponse = 
          await axios.post("http://127.0.0.1:5000/check_relationship",{
            user1, user2
          });
          
          console.log(relationshipResponse.data);


          if(relationshipResponse.data.related){
            const check = window.confirm("Users are related. Do you want to check for cyberbullying?");
            if(!check)
              {
                alert("Skipped")
                setResult("Cyberbullying check skipped by the user choice");
                return;
              }
            }
          const bullyingResponse = await axios.post("http://127.0.0.1:5000/check_cyberbullying",{
            text:tweet
          });
          console.log(bullyingResponse);
          const classDescription = getClassDescription(bullyingResponse.data.predicted_class);
          setResult(`Your Predicted Class: ${classDescription}`);
          //setResult(`Your Predicted Class: ${bullyingResponse.data.predicted_class}`);
      }catch(error)
      {
      console.error("There was an error, reached catch block!",error);
    }
  };

  const getClassDescription = (predictedClass) => {
    switch (predictedClass) {
      case 0:
        return 'Cyberbullying';
      case 1:
        return 'Sexism or Racism Joke';
      case 2:
        return 'No Cyberbullying Detected';
      default:
        return 'Unknown Class';
    }
  };
  return (
    <>
      <div>
        <h1>Cyberbullying Detection</h1>
        <table>
          <tr>
            <td>
              <label>Enter Tweet: </label>
            </td>
            <td>
              <input value={tweet} onChange={(e)=> setTweet(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              <label>User 1: </label>
            </td>
            <td>
              <input type="text" value={user1} onChange={(e) => setUser1(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
            <label>User 2: </label>
            </td>
            <td>
            <input type="text" value={user2} onChange={(e) => setUser2(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <label><button onClick={handleSubmit}>Submit</button></label>
          </tr>
          <tr>
            {result && <div><h2>Result:</h2><p>{result}</p></div>}
          </tr>
        </table>
      </div>
    </>
  )
}

export default App
