const apiKey = "AIzaSyBZPvSbSAH0IilJHoGnZupJ0XupwgN6rKo";  // Utilisez votre nouvelle clé API
const sheetId = "14fJ9BUFKBT2Jmj3yn52LfB3fJ4WLuQVPpshgm1lOnv8";
const range = "'Réponses au formulaire 1'!A6:E200000";
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
const ROW_START = 7;
const COL_START = 65; //A in ASCII
let canSendScoreRequest = true;

const dateSet = new Set(); // Manage duplicates

let allMessagesData = [];
let currentPage = 0;
let messagesPerPage = 3;


//FETCH SOURCE
/*https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch*/

// This is to debounce any function which is suseptible to abuse
/*SOURCE : https://stackoverflow.com/questions/24004791/what-is-the-debounce-function-in-javascript */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Debounced functions
const debouncedUpdateUpScore = debounce(updateScore, 1000); 
const debouncedUpdateDownScore = debounce(updateScore, 1000); 
const debouncedComment = debounce(updateComment, 1000);


// Score-to-server management
function sendScoreToServer(cellLocation, newValue){

    const url = 'http://localhost:5000/update_score';

    const data = {
        cell_location: cellLocation,
        new_value: newValue
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success'){
            console.log('Score updated successfully:', data);
        }
        else{
            console.error('Error updating score:', data.message);
        }
        canSendScoreRequest = true;
    })
    .catch(error =>{
        console.error('Error', error);
        canSendScoreRequest = true;
    });
}
function updateScore(col, row, newValue){

    if(canSendScoreRequest === true){
        canSendScoreRequest = false;
        const cellLocation = `${String.fromCharCode(col)}${row}`;
        sendScoreToServer(cellLocation, newValue);
    }
    else{
        setTimeout(() => {
            console.log("Overflow, I will wait 1 second before re-trying.")
            updateScore(col, row, newValue);
        }, 1000);
    }
}
// Score button functionality
function incrementUpscore(button, event){

    event.stopPropagation(); // Stop the click from progressing through the text-block

    let textBlock = button.closest('.text-block');
    let upScoreElement = textBlock.querySelector('#up-score');
    let downScoreElement = textBlock.querySelector('#down-score');
    let dislikeButton = textBlock.querySelector('.dislike');
    
    let row = textBlock.querySelector('.text-info').dataset.row;
    let colUp = COL_START + 2;
    let colDown = COL_START + 3;

    // Toggle score
    if (textBlock.dataset.scoreToggled !== "true")
        toggleScore(textBlock);


    // Switching between cancelling and submitting the vote
    if(textBlock.dataset.upscoreIncremented === "true"){
        button.classList.remove('active'); // Deactivate the highlight

        textBlock.dataset.upscoreIncremented = "false";
        upScoreElement.textContent = parseInt(upScoreElement.textContent) - 1;
    }
    else{
        button.classList.add('active'); // Activate the highlight

        textBlock.dataset.upscoreIncremented = "true";
        upScoreElement.textContent = parseInt(upScoreElement.textContent) + 1;
        

        // Deactivating the dislike
        if (textBlock.dataset.downscoreIncremented === "true") {
            dislikeButton.classList.remove('active'); // Deactivate the highlight on the dislike

            textBlock.dataset.downscoreIncremented = "false";
            downScoreElement.textContent = parseInt(downScoreElement.textContent) - 1;

            debouncedUpdateDownScore(colDown, row, downScoreElement.textContent); // Update the dislike score
            
        }
    }
    debouncedUpdateUpScore(colUp, row, upScoreElement.textContent);
    
}
// Repetition to make it easier to read
function incrementDownscore(button, event){

    event.stopPropagation();

    let textBlock = button.closest('.text-block');
    let upScoreElement = textBlock.querySelector('#up-score');
    let downScoreElement = textBlock.querySelector('#down-score');
    let likeButton = textBlock.querySelector('.like');

    let row = textBlock.querySelector('.text-info').dataset.row;
    let colUp = COL_START + 2;
    let colDown = COL_START + 3;

    if (textBlock.dataset.scoreToggled !== "true")
        toggleScore(textBlock);

    if(textBlock.dataset.downscoreIncremented === "true"){
        button.classList.remove('active'); 

        textBlock.dataset.downscoreIncremented = "false";
        downScoreElement.textContent = parseInt(downScoreElement.textContent) - 1;
    }
    else{
        button.classList.add('active'); 

        textBlock.dataset.downscoreIncremented = "true";
        downScoreElement.textContent = parseInt(downScoreElement.textContent) + 1;
        
        if (textBlock.dataset.upscoreIncremented === "true") {
            likeButton.classList.remove('active');

            textBlock.dataset.upscoreIncremented = "false";
            upScoreElement.textContent = parseInt(upScoreElement.textContent) - 1;
 
            debouncedUpdateUpScore(colUp, row, upScoreElement.textContent);
        }
    }
    debouncedUpdateDownScore(colDown, row, downScoreElement.textContent);
}
function toggleScore(textBlock){

    textBlock.dataset.scoreToggled = textBlock.dataset.scoreToggled === "true" ? "false" : "true";

    textBlock.querySelector('#up-score').classList.toggle('open');
    textBlock.querySelector('#down-score').classList.toggle('open');
}



// Comment-to-server management
function sendCommentToServer(cellLocation, newValue){

    const url = 'http://localhost:5000/append_value';

    const data = {
        cell_location: cellLocation,
        new_value: newValue
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success'){
            console.log('Comment added successfully:', data);
        }
        else{
            console.error('Error adding the comment:', data.message);
        }
    });
}
function updateComment(col, row, newValue){

    const cellLocation = `${String.fromCharCode(col)}${row}`;
    sendCommentToServer(cellLocation, newValue);
}
function toggleComments(button, event) {

    event.stopPropagation(); // pour arreter la propagation jusquau text-block
    const commentsSection = button.closest('.text-block').querySelector('.comments');
    commentsSection.classList.toggle('open');
}
function addComment(button, event) {

    event.stopPropagation();

    const textArea = button.previousElementSibling;
    const commentText = textArea.value.trim();

    let textBlock = button.closest('.text-block');
    let row = textBlock.querySelector('.text-info').dataset.row;
    let col = COL_START + 4;


    if (commentText) {
        const commentList = button.closest('.comments').querySelector('.comment-list');
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.textContent = commentText;
        commentList.appendChild(newComment);
        textArea.value = '';
        debouncedComment(col, row, newComment.textContent);

    }
}

// Comments
function displayStoredComment(messageBlock, jsonCommentList){

    const commentList = messageBlock.querySelector('.comment-list')

    // Try to parse, if yes, than add
    if (jsonCommentList){
        let comments = JSON.parse(jsonCommentList);
        console.log('JSON COMMENT:', jsonCommentList);
        comments.forEach((element) => {
            let newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.textContent = element;
            commentList.appendChild(newComment);
        })
    }
}
function displayComment(){

    document.getElementById('message-container').addEventListener('click', function(event) {
        const action = event.target.closest('button')?.dataset?.action; //le '?' empeche de faire closest('button') sur null
        if (!action) return;
        
        const button = event.target.closest('button');
        
        switch(action) {
            case 'comment':
                toggleComments(button);
                break;
            case 'add-comment':
                addComment(button);
                break;
        }
    });
}
displayComment()



// Message display
async function loadAllMessages(){

    console.log('Request URL:', url); // Debug message
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Data received:', data); // Debug message

    allMessagesData = data.values
        .filter((message, index) => index !== 0 && message[1] !== undefined && message[0] !== '')
        .map((message, index) => ({
            row: index + ROW_START,
            data: message
        }));

    console.log("Loaded this:", allMessagesData);

    loadMoreMessages();
}
function loadMoreMessages() {

        const start = currentPage * messagesPerPage;
        const end = start + messagesPerPage;
        const messagesToShow = allMessagesData.slice(start, end);

        const messageContainer = document.getElementById('message-container');

        messagesToShow.forEach((messageObj) => {         //forEach va toujours metttre 3 arguments dans la fonction imbriqué

            const messageDate = messageObj.data[0];

            

            if(dateSet.has(messageDate)){
                console.log('Duplicate was found')
                return;
            }
            else{
                dateSet.add(messageDate);
            }

            const messageBlock = createMessageBlock(messageObj);
            messageContainer.appendChild(messageBlock);


        });
            // Increment the page counter after the first set of messages is displayed
        if (messagesToShow.length > 0) {
            currentPage++;
        }
        
    }
function createMessageBlock(messageObj){

    const message = messageObj.data;
    const rowNumber = messageObj.row;  // Get the original row number

    const messageBlock = document.createElement('div');
    messageBlock.className = 'text-block';
    messageBlock.onclick = function() { toggleScore(this); }; // messageBlock.onclick = 'toggleScore(this)'; /* il faut attribuer une fonction!!!

    // If there are no dislikes or likes yet written in the google sheet
    const upScore = message[2] !== undefined ? message[2] : 0;
    const downScore = message[3] !== undefined ? message[3] : 0;
    const commentList = message[4];

    const fontSize = getFontSize(upScore, downScore);

    messageBlock.innerHTML = `
        <div class="text-info" data-row = "${rowNumber}" >
            <div class="message-score" id="up-score-icon">
                <div id="up-score" style="font-size: ${fontSize}">${upScore}</div>
            </div>
            <div id="message-date">${message[0]}</div>
        </div>
        <br></br>
        <p>${message[1]}</p>
        <div class="message-score" id="down-score-icon">
            <div id="down-score" style="font-size: ${fontSize}">${downScore}</div>
        </div>
        <div class="actions">
            <button class="like" onclick="incrementUpscore(this, event)"><i class="fa fa-heart -o"></i></button>
            <button class="dislike" onclick="incrementDownscore(this, event)"><i class="fa fa-thumbs-down -o"></i></button>
            <button class="comment" onclick="toggleComments(this, event)"><i class="fa fa-comment -o"></i></button>
        </div>
        <div class="comments" style="display: block">
            <div class="comment-list"></div>
            <div class="comment-form">
                <textarea placeholder="Write your thoughts here !"></textarea>
                <button onclick="addComment(this, event)"><i class="fa fa-arrow-circle-right -o"></i></button>
            </div>
        </div>`;
        displayStoredComment(messageBlock, commentList);
        return messageBlock;
}
function getFontSize(upScore, downScore) {
    if (upScore >= 1000 || downScore >= 1000) {
        return '10px';
    }
    else if (upScore >= 100 || downScore >= 100){
        return '11px';
    }
    else if (upScore >= 10 || downScore >= 10){
        return '12px';
    }
    return '13px';
}
loadAllMessages();



// Search option
function searchMessages(inputValue){

    console.log("Searching for:", inputValue);

    const searchQuery = inputValue.toLowerCase();
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = ''

    const filteredMessages = allMessagesData.filter(message => {
        const messageText = message.data[1].toLowerCase();
        return messageText.includes(searchQuery);
    });

    filteredMessages.forEach((message, index) => {
        const messageBlock = createMessageBlock(message, index);
        messageContainer.appendChild(messageBlock);
    });

    // // Hide all messages
    // const allMessages = messageContainer.querySelectorAll('.text-block');
    // allMessages.forEach(messageBlock => {
    //     messageBlock.style.display = 'none';
    // })

    // // Show messages
    // allMessages.forEach(messageBlock => {
    //     const messageText = messageBlock.querySelector('p').textContent.toLowerCase(); // select <p>
    //     if (messageText.includes(searchQuery)){
    //         messageBlock.style.display = 'block';
    //     }
    // })

}
function toggleSearch() {
    const searchContainer = document.getElementById('search-container');

    if (searchContainer.style.maxWidth === '0px' || searchContainer.style.maxWidth === '') {
        searchContainer.style.maxWidth = '300px'; // Expand the search bar
    } else {
        searchContainer.style.maxWidth = '0'; // Collapse the search bar
    }
}
function toggleAllButtonText() {
    const buttons = document.querySelectorAll('.tab-buttons button');
    buttons.forEach(button => {
        button.classList.add('hide-text');
    });
}
function reload(){
    // Clear existing messages in the DOM
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '';

    // Re-render the sorted messages
    currentPage = 0; // Reset pagination
    dateSet.clear(); // Reset duplicate check
    loadMoreMessages();
}

// Latest
function parseDate(dateString){
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    return new Date(year, month, day, hours, minutes, seconds);
}
function latestSearch(){

    allMessagesData.sort((a, b) => {
        try{
            const dateA = parseDate(a.data[0]);
            const dateB = parseDate(b.data[0]);
            return dateB - dateA;  // Sort by descending order
            // return dateA - dateB;  // Sort by ascending order
        }
        catch{
            console.log("Error, dateA=", a[0],"dateB=", b[0], "messageA=", a, "messageB=", b);
        }
    })
    reload();
}

// Popular
function popularSearch(){
    allMessagesData.sort((a, b) => {

        const upScoreA = parseInt(a.data[2], 10) || 0; //base 10, if not, than 0
        const upScoreB = parseInt(b.data[2]) || 0;
        return upScoreB - upScoreA;


    })
    reload();
}



// Scrolling event listener
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadMoreMessages();
    }
});
document.addEventListener('DOMContentLoaded', loadMoreMessages);
