
$(function(){

    const access='39d2fb31f8cbb23a92524f7e541c9621';

    const LASTFM_TOP_ALBUMS_URL="https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=YOUR_USER_NAME&period=DESIRED_TIMEFRAME&api_key=YOUR_API_KEY&format=json";
    
    const LASTFM_USER_FRIENDS_URL="https://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=YOUR_USER_NAME&limit=500&api_key=YOUR_API_KEY&format=json"

    const friendArray = [];

    let SCORE = 0;
    let QUESTIONS = 0;
    let numberAnswered = 0;


    function renderFeedback(data1, data2){
        //const selectedAlbum = $(this).attr('src');

        //Feedback if CORRECT and IS NOT last question
        if (data1 === data2 && numberAnswered !== QUESTIONS){
            $('.photos').html(`
            <div  class="js-feedbackForm">  
            <img  aria-live="assertive" class='album no-style' src=${data1}/>
            <p>CORRECT</p>
            <button>NEXT</button>
            </div>
            `);
            $('button').click(() => {
                $('.js-feedbackForm').addClass('hidden');
                $('.js-results').toggleClass('hidden');
            }); 
            SCORE++;x
        }
        //Feedback if CORRECT AND IS last Question
        else if (numberAnswered === QUESTIONS && data1 === data2){
            SCORE++;
            $('.photos').html(`
            <div  class="js-feedbackForm"> 
            <img  aria-live="assertive" class='album no-style' src=${data1}/>
            <p>CORRECT</p> 
            <p>FINAL SCORE IS: ${SCORE}/${QUESTIONS}</p>  
            <button>PLAY AGAIN!</button>
            </div>
            `);
            $('button').click(() => {
                $('.js-feedbackForm').addClass('hidden');
                $('.js-results').toggleClass('hidden');
                location.reload(true);
            });       
        }  
        //Feedback if INCORRECT and IS last question
        else if (numberAnswered === QUESTIONS && data1 !== data2) {
            $('.photos').html(`
            <div  class="js-feedbackForm">
            <img  aria-live="assertive" class='album no-style' src=${data1}/>
            <p>INCORRECT</p>  
            <p>FINAL SCORE IS: ${SCORE}/${QUESTIONS}</p>  
            <button>PLAY AGAIN!</button>
            </div>
            `);
            $('button').click(() => {
                $('.js-feedbackForm').addClass('hidden');
                $('.js-results').toggleClass('hidden');
                location.reload(true);
            }); 

        }
        //Feedback if INCORRECT and IS NOT last question
        else {
            $('.photos').html(`
            <div  class="js-feedbackForm">
            <img  aria-live="assertive" class='album no-style' src=${data1}/>
            <p>INCORRECT</p> 
            <button>NEXT</button>
            </div>
            `);
            $('button').click(() => {
                $('.js-feedbackForm').addClass('hidden');
                $('.js-results').toggleClass('hidden');
            }); 
        }
    }
       
    function displayAnswerOptions(){ 
        //recieves an array of user topalbum objects. displays the username and corresponding top album in a select menu for the user to use for selecting their answer
        $('.album').click( function(){
            const selectedAlbum = $(this).attr('src');
            $('.js-results').addClass('hidden');
            $('.photos').html(
                ` 
                <div class='answer-form'>
                <form class='working'>
                    <label for="answer-select">Choose the username associated with this album:</label>
                    <img  aria-live="assertive" class='album no-style' src=${selectedAlbum} />
                    <select id="answer-select">
                        <option value="">--Please choose an option--</option>
                    </select>
                    </div>
                    </form>
                `
            );

            //Randomizes the album images created
            friendArray.sort(() => Math.random() - 0.5);

            //renders randomized options to drop down menu
            friendArray.forEach(element => {
                $('#answer-select').append(
                    `
                        <option value="${element.topalbums.album[0].image[3]['#text']}">${element.topalbums['@attr']['user']}</option>
                    `
                );
            }); 

            //User selects an answer from the drop down menu
            $('#answer-select').change(() => {
                const userAnswer = $('#answer-select').val();
                $(this).submit();    
                event.preventDefault();
                $(this).toggleClass('hidden');
                numberAnswered++;
                $('.answer-form').toggleClass('hidden');
                //$('.js-results').toggleClass('hidden');
                renderFeedback(selectedAlbum, userAnswer);
            });
        });   
    } 

    function displayAllAlbums(data){
        $('.js-gameform').remove(); 
        data.forEach(element => {
            const albumArtURL = element.topalbums.album[0].image[3]['#text'];
            const albumName = element.topalbums.album[0]['name'];
            const albumArtist = element.topalbums.album[0].artist['name'];
            if (albumArtURL === ""){
                //Skips album if there is none avail/listed on last.fm api
                return;
            }
            //Skips over any albums that may have incomplete/mislabed metadata 
            else if (albumName === 'MP3' && albumArtist === '[unknown]'){
                return;
            }
            else {
                //displays official album covers
                $('.js-results').addClass('active').append(
                    `
                    <img  aria-live="assertive"  class='album' src=${albumArtURL} alt="${albumName} by ${albumArtist}" title="${albumName} by ${albumArtist}"/> 
                    `
                );
                QUESTIONS++;
            } 
        });
       displayAnswerOptions();
    }

    function getFriendTopAlbum(friends){ 
        friends.forEach(element => {
            const timeframe = getTimeframe();
            const albumUrl = LASTFM_TOP_ALBUMS_URL
                .replace('YOUR_API_KEY', access)
                .replace('YOUR_USER_NAME', element)
                .replace('DESIRED_TIMEFRAME', timeframe)
            $.getJSON(albumUrl)
                .then(json => {
                    if (json.topalbums['@attr'].total !== '0'){
                    displayAllAlbums([json]);
                    friendArray.push(json);
                    }
                    else {
                        return;
                    }
                })
        });
    }

    function getUserFriendList(data){
       const friendList = data.friends.user.map(element => {
            return element.name;    
        });
        getFriendTopAlbum(friendList);     
    }
    
    function getTimeframe(){
        return $("[name='timeframe']:checked").val();
    }
    
    function getUserName(){
        return $('#username').val();
    }

    function renderGame(){
        const html = $('#entry-form-tpl').html()
        $('.js-results').html($('#entry-form-tpl').html());

        $('.js-gameform').submit(ev => {
            ev.preventDefault();
            const username = getUserName();
            
            userLookup(username)
                .then(() => getUserFriends(username))
                .then(json => getUserFriendList(json))
                .catch(err => {
                    if (err.status === 404) {
                        alert(`User does not exist`)
                    }
                    else {
                        console.error(err)
                        alert(`Something went wrong`)
                    }
                })
        });
    }

    function getUserFriends (username) {
        const url = LASTFM_USER_FRIENDS_URL
            .replace('YOUR_API_KEY', access)
            .replace('YOUR_USER_NAME', username);

        return $.getJSON(url)
    }

    function userLookup (user) {
        const params = Object.entries({
            method: 'user.getinfo',
            api_key: access,
            format: 'json',
            user
        })
            .map(([key, val]) => `${key}=${val}`)
            .join('&')
        
        return $.getJSON(`https://ws.audioscrobbler.com/2.0/?${params}`)
    }

    function startGame(){
        $('.js-intro').click(event => {
            event.preventDefault();
            $('.js-intro').remove();
            renderGame();
        });
    }
  
    startGame();
});