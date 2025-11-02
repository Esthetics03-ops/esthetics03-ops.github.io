<script>
const axios = require('axios');
const githubToken = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
const facebookAppId = '123456789012345';
const facebookAppSecret = 'abcdefghijklmnopqrstuvwxyz';
const repoOwner = 'esthetics03-ops';
const repoName = 'esthetics03-ops.github.io';

// Function to upload content to GitHub
async function uploadToGitHub(content) {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${content.fileName}`;
  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Content-Type': 'application/json'
  };
  const data = {
    'message': content.message,
    'content': content.content
  };
  try {
    const response = await axios.put(url, data, { headers });
    console.log(`Uploaded to GitHub: ${content.fileName}`);
  } catch (error) {
    console.error(`Error uploading to GitHub: ${error.message}`);
  }
}

// Function to get Facebook page access token
async function getFacebookPageAccessToken() {
  const url = `https://graph.facebook.com/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&grant_type=client_credentials`;
  try {
    const response = await axios.get(url);
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error(`Error getting Facebook page access token: ${error.message}`);
  }
}

// Function to post content to Facebook
async function postToFacebook(content) {
  const accessToken = await getFacebookPageAccessToken();
  const url = `https://graph.facebook.com/v13.0/me/feed?access_token=${accessToken}`;
  const data = {
    'message': content.message
  };
  try {
    const response = await axios.post(url, data);
    console.log(`Posted to Facebook: ${content.message}`);
  } catch (error) {
    console.error(`Error posting to Facebook: ${error.message}`);
  }
}

// Example usage
const content = {
  fileName: 'wellness-tips.md',
  message: 'New wellness tips article!',
  content: 'SGVsbG8gd29ybGQh'
};
uploadToGitHub(content);
postToFacebook(content);

</script>

