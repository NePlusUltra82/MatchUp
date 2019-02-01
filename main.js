
/* Would it be possible to intergrate the Spotify API as follows:

    1) Search for Artist/Album Name on Spotify using data from Last.fm 'Get Top Albums' API: 
            https://www.last.fm/api/show/user.getTopAlbums

    2) Render Spotify Player when image icon is clicked --- brings up album and all songs (individually selectable)

*/



$(function(){

    const access='39d2fb31f8cbb23a92524f7e541c9621';

    const LASTFM_TOP_ALBUMS_URL="http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=YOUR_USER_NAME&period=DESIRED_TIMEFRAME&api_key=YOUR_API_KEY&format=json";
    
    const LASTFM_USER_FRIENDS_URL="http://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=YOUR_USER_NAME&limit=500&api_key=YOUR_API_KEY&format=json"


    $('.js-intro').click(event => {
        event.preventDefault();
        $('.js-intro').remove();
        renderGame();
    });
    
    function renderFeedback(){
          
    }

    function updateScore(){
        
        /*

        This should provide feedback based on correct/incorrect answer. If incorrect, it should list what friend actually listened to 
        the album immediately and update the total score then proceed to next album. Perhaps use an animation that flips the album image
        around to a blank colored background with the actual user's profile image displayed and then remove it from the DOM and adjust/
        rearrange the remaining albums and repeat until NO albums are left ---only a FINAL feedback page listing the overall score
        maybe create: renderFinalFeedback() for this purpose?
        would also be cool if you click one album to match and the rest disappear until the user initially answers and feedback is given
        have something that looks like a disheveled stack of vinyl records in the background ---but using actual covers from the albums list via last.fm
        OR start the game off with the vinyl stack and answer each one by one off the top of the stack and animate the album spinning off the stack after it flips
        over and reveals the feedback
        Resources: http://animista.net/play/exits/swirl-out/swirl-out-bottom-fwd
                    https://designshack.net/articles/css/use-pseudo-elements-to-create-an-image-stack-illusion/

        */
        


    }

    function displayAllAlbums(data){

            /* 
            
             Need to find a way to randomize the order of images displayed to the user ---
                Should the image URLs be randomized OR the data from friends list URL? 
             
             Also, how to make the page responsive to the size of the viewport AND the number of albums to display.

             Example --- What if the user only has (3) friends aka (3) albums to display...
                How can the web app adjust the image display or size without distorting the image?

             How to EXCLUDE -- ALL UNDEFINED/INACTIVE Users AND BROKEN/MISSING IMAGES (set default image with title listed for this case?) from the game aka friendlist/top albums searches/results? 
                (Use an if statement?)

             Any way to implement an 'infinite scroll' display that automatically loads more album images as the user scrolls down the page 
                ---similar to twitter/facebook feeds?   

             Need to ADD a displayAllFriends() that shows the profile name/real name and profile pic of all friends
                ---then I need to SPLIT the screen in order to show the list of albums and list of users to match on each side.

                ---OR create a visualization that will display a branched chain with a # of Users connected to an album and 
                    from this visualization be able to click on a Users pic/name as a way to match/answer then provide instant
                    FEEDBACK and SCORE UPDATE --- EXAMPLE: https://www.conceptdraw.com/How-To-Guide/what-is-a-circle-spoke-diagram
             */

        $('.js-gameform').remove();
        data.forEach(element => {
            $('.js-results').append(
                `
                   <img src=${element.image[3]['#text']} alt="${element['name']} by ${element.artist['name']}" title="${element['name']} by ${element.artist['name']}"/> 
                `
            );
        });
    }


    function getFriendAlbumUrl(friends){
        friends.forEach(element => {
            const timeframe = getTimeframe();
            const albumUrl = LASTFM_TOP_ALBUMS_URL
            .replace('YOUR_API_KEY', access)
            .replace('YOUR_USER_NAME', element)
            .replace('DESIRED_TIMEFRAME', timeframe)
            $.getJSON(albumUrl)
            //.then(json => console.log(json));
            .then(json => displayAllAlbums([json.topalbums.album[0]]));
            console.log(timeframe);
        });
    }

    function getUserFriendList(data){

        //Need to create a way to EXCLUDE any friends with no recent data aka they have NO top albums

       const friendList = data.friends.user.map(element => {
            return element.name;    
        });
        getFriendAlbumUrl(friendList);
        //console.log(friendList)
    }
    
    function getTimeframe(){
        return $("[name='timeframe']:checked").val();
    }
    
    function getUserName(){

        //Need to create a test/prompt to the user if the Last.fm profile name entered is invalid

        return $('#username').val();
    }

    function renderGame(){
        $('.js-results').html(
        `   <form action="" role="form" class='js-gameform'>
                <label for="username">Last.fm User Name:</label>
                <input type="text" id="username" size='35' required placeholder="Enter your Last.fm profile name here">
                <fieldset>
                    <legend>Choose a timeframe:</legend>
                    <label for="week">Within Last Week:</label>
                    <input type="radio" id="week" name="timeframe" value="7day" required>
                    <label for="month">Within Last Month:</label>
                    <input type="radio" id="month"  name="timeframe" value="1month" required>
                    <label for="year">Within Last Year:</label>
                    <input type="radio" id="year" name="timeframe" value="12month" required>
                    <label for="overall">Overall:</label>
                    <input type="radio" id="overall" name="timeframe" value="overall" required>
                </fieldset>
                <button type="submit">Submit</button>
            </form>
        `);
        $('.js-gameform').submit(ev => {
            ev.preventDefault();
            const username = getUserName();
            const url = LASTFM_USER_FRIENDS_URL
                .replace('YOUR_API_KEY', access)
                .replace('YOUR_USER_NAME', username);
            $.getJSON(url)
                //.then(json => console.log(json))
                .then(json => getUserFriendList(json));
        });
    }
});