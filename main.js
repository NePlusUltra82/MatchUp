
$(function(){

    const access='39d2fb31f8cbb23a92524f7e541c9621';

    const LASTFM_TOP_ALBUMS_URL="http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=YOUR_USER_NAME&period=DESIRED_TIMEFRAME&api_key=YOUR_API_KEY&format=json";
    
    const LASTFM_USER_FRIENDS_URL="http://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=YOUR_USER_NAME&limit=500&api_key=YOUR_API_KEY&format=json"

    const friendArray = [];

    let SCORE = 0;
    let QUESTIONS = 0;


    $('.js-intro').click(event => {
        event.preventDefault();
        $('.js-intro').remove();
        renderGame();
    });

    function updateScore() {
        SCORE++;
        console.log(`Current Score: ${SCORE}/${QUESTIONS}`);   
    }

    function renderFeedback(data1, data2){
        $('.answer-form').toggleClass('hidden');

        $('.js-results').toggleClass('hidden');

        if (data1 === data2 ){
            console.log('correct');
            updateScore();
        }
        else if (data2 === 'images/default-album-image.jpg') {
            console.log('correct')
            updateScore();


        }
        else {
            console.log('incorrect');
            console.log(`Current Score: ${SCORE}/${QUESTIONS}`);
        }
        
       
       /* This should provide feedback based on correct/incorrect answer. If incorrect, it should list what friend actually listened to 
        the album immediately and update the total score then proceed to next album. Perhaps use an animation that flips the album image
        around to a blank colored background with the actual user's profile image displayed and then remove it from the DOM and adjust/
        rearrange the remaining albums and repeat until NO albums are left ---only a FINAL feedback page listing the overall score
        maybe create: renderFinalFeedback() for this purpose? */
          
    }
    
    
    function displayAnswers(){ 
        //recieves an array of user topalbum objects. displays the username and corresponding top album in a select menu for the user to use for selecting their answer
        $('.album').click( function(){
            const selectedAlbum = $(this).attr('src');
            $('.js-results').toggleClass('hidden');

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

           // $('.answer-form').toggleClass('hidden');

            friendArray.forEach(element => {
                $('#answer-select').append(
                    `
                        <option value="${element.topalbums.album[0].image[3]['#text']}">${element.topalbums['@attr']['user']}</option>
                    `
                );
            }); 

            $('#answer-select').change(() => {
                const userAnswer = $('#answer-select').val();
                $(this).submit();    
                event.preventDefault();
                console.log(userAnswer);
                renderFeedback(selectedAlbum, userAnswer); 
            });
            $(this).toggleClass('hidden');

        });

    } 

    function displayAllAlbums(data){
        $('.js-gameform').remove(); 
        data.forEach(element => {
            const albumArtURL = element.topalbums.album[0].image[3]['#text'];
            const albumName = element.topalbums.album[0]['name'];
            const albumArtist = element.topalbums.album[0].artist['name'];
            if (albumArtURL === ""){
                //displays DEFAULT album art if there is none avail/listed on last.fm api
              /*  $('.js-results').addClass('active').append(
                    `
                    <img  aria-live="assertive" class='album' src='images/default-album-image.jpg' alt="${albumName} by ${albumArtist}" title="${albumName} by ${albumArtist}"/> 
                    `
                );
                
                */
                //increments when each photo is rendered ---provides the total # of photos aka questions
               // QUESTIONS++;
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
       displayAnswers();
    }

    function getFriendAlbumUrl(friends){
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
        getFriendAlbumUrl(friendList);     
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
        
        return $.getJSON(`http://ws.audioscrobbler.com/2.0/?${params}`)
    }
});