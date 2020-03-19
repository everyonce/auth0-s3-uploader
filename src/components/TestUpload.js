// src/components/TestUpload.js

import React, { useRef } from 'react';
import { useAuth0 } from '../contexts/auth0-context';
import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';
 
import { v1 as uuidv1 } from 'uuid';


export default function TestUpload () {

   
const firstName = useRef(null);
const lastName = useRef(null);
const email = useRef(null);

const x = useAuth0();

  const handleClick = (event) => {
    event.preventDefault();
    x.getTokenSilently({audience:process.env.REACT_APP_AUTH0_API, scope:"openid"}).then(token=> 
      {
        console.log("got token: " + token);
        AWS.config.update(
          {
            region: process.env.REACT_APP_AWS_REGION,
            credentials: new AWS.WebIdentityCredentials({
              RoleArn: process.env.REACT_APP_AWS_ROLE_ARN,
              WebIdentityToken: token
            })
          });
  
        AWS.config.credentials.get(function(err) {
            if (err) {
              console.log("Error creating AWS Web Identity: " + err);
              return;
            }
            var bucket = new S3({
            params: {
                Bucket: process.env.REACT_APP_AWS_BUCKET
            }
            });
            bucket.listObjects({ Prefix: '' }, function (err, data) {
              if (err) {
                console.log('ERROR: ' + err);
              } else {
                data.Contents.forEach(function (obj) {
                  console.log(obj.Key);
                });
              }
            });
            var params = {
              Body: '"test data","test2","test3"', 
              Bucket: process.env.REACT_APP_AWS_BUCKET, 
              Key: process.env.REACT_APP_AWS_DATA_PREFIX+uuidv1()+".csv"
            }
          
            const s3 = new AWS.S3();
            s3.putObject(params, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else     console.log("successful upload:" + JSON.stringify(data));           // successful response
            });
        });
      });

    //alert("you clicked: "+ JSON.stringify(firstName.current.value));


  }


    return (
          <form>
            <label>
              First Name:
              <input type="text" name="firstName" defaultValue="testFirst" ref={firstName} />
            </label>
<br />
            <label>
              Last Name:
              <input type="text" name="lastName" defaultValue="testLast" ref={lastName} />
            </label>
            <br />
            <label>
              Email:
              <input type="text" name="email" defaultValue="emailTest" ref={email} />
            </label> 
            <br />          
            <button onClick={handleClick}>Upload Data</button>
          </form>
    );
}


