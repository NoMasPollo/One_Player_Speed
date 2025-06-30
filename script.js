let globalH = null;
//Starts the game
function startGame (){
    if(globalH === null){globalH = new Handler();}
    else if(globalH.ended === true){
        globalH.initializer();
    }
} 




//More or less runs the gameplay, including initializing and shuffling all piles
class Handler {
    constructor(){
        //Create variables
        this.ended = false;
        this.backup1 = [];
        this.backup2 = [];
        this.pile1 = [];
        this.pile2 = [];
        this.hand = [];
        this.deck = [];
        this.timer;
        this.timerVar = 0.0;

        //Make variables for document parts
        this.pile1Element = document.getElementById("pile1");
        this.pile2Element = document.getElementById("pile2");
        this.deckElement = document.getElementById("deck");
        this.backup1Element = document.getElementById("backup1");
        this.backup2Element = document.getElementById("backup2");
        this.handElement = document.getElementById("hand");
        this.deckTextElement = document.getElementById("deckRemaining");
        this.backup1TextElement = document.getElementById("backup1Remaining");
        this.backup2TextElement = document.getElementById("backup2Remaining");
        this.cancelCard = document.getElementById("cancel");
        this.timerElement = document.getElementById("timer");

        //Call the function that creates and deals cards
        this.initializer();

        //Add events to the elements and give them a reference to this handler instance
        this.backup1Element.addEventListener('click', this.flipPile);
        this.backup1Element.scriptH = this;

        this.backup2Element.addEventListener('click', this.flipPile);
        this.backup2Element.scriptH = this;

        this.deckElement.addEventListener('click', this.drawFromDeck);
        this.deckElement.scriptH = this;

        this.cancelCard.addEventListener('click', () => this.cancel());

        for(this.cardElement of this.handElement.children){
            this.cardElement.addEventListener('click', this.clickHand);
            this.cardElement.scriptH = this;
        }
        this.pile1Element.scriptH = this;
        this.pile1Element.pileNum = 1;

        this.pile2Element.scriptH = this;
        this.pile2Element.pileNum = 2;
    }

    //Fundamental gameplay functions

    //Creates and deals cards
    initializer(){
        //Populate the deck with cards
        for (let s = 1; s <= 4; s++){
            for (let v = 1; v <= 13; v++){
                const newCard = new Card(s, v);
                this.deck.push(newCard); 
            }
        }

        //Call shuffle and deal cards
        this.shuffle(this.deck);
        this.dealerCall();

        //Call all visual update functions
        this.updateHand();
        this.updateBackups();
        this.updatePiles();
        this.updateDeck();

        this.timerVar = 0.0;
        this.timer = setInterval(this.timerIncrement, 10)
    }

    timerIncrement(){
        globalH.timerVar += 1;
        globalH.timerElement.innerText = (globalH.timerVar/100);
    }

    //Moves cards from deck to each pile in requisite amounts
    dealerCall(){
        this.draw(this.backup1, 9);
        this.draw(this.backup2, 9);
        this.draw(this.pile1, 1);
        this.draw(this.pile2, 1);
        this.draw(this.hand, 5);
    }

    //Moves a card from deck to some pile
    draw (array, intN){
        for (let i = 0; i < intN; i++){
            if(this.deck.length != 0){
            array.push(this.deck[0]);
            this.deck.shift();
            }
        }
    }

    //Draws from deck to hand until full
    drawFromDeck(event){
        let handler = event.target.scriptH;
        handler.draw(handler.hand, 5 - handler.hand.length);
        handler.updateHand();
        handler.updateDeck();
    }

    //Cleanup for effects of clickHand
    cancel() {
        for(this.cardElement of this.handElement.children){
            this.cardElement.addEventListener('click', this.clickHand);
            this.cardElement.style.bottom = '0px';
        }
        this.deckElement.addEventListener('click', this.drawFromDeck);
        this.backup1Element.addEventListener('click', this.flipPile);
        this.backup2Element.addEventListener('click', this.flipPile);

        this.pile1Element.removeEventListener('click', this.clickPile);
        this.pile2Element.removeEventListener('click', this.clickPile);
        this.cancelCard.style.display = 'none';  
    }

        //Function that handles attempting to play a card on a pile
    playCard (pileChoice){
        let index = 0;
        let cardInHand = null;
        for(this.cardElement of this.handElement.children){
            if(this.cardElement.style.bottom == '50px'){
                cardInHand = this.hand[index];
                break;
            }
            index++;
        }
        if(cardInHand == null){return;}
        let card = this.pile2[0];
        if (pileChoice == 1){
            card = this.pile1[0];
        }
        const playable = cardInHand.isPlayValid(card); 
        if (playable == true & pileChoice == 1){
            this.cancel();
            this.pile1.unshift(cardInHand);
            this.hand = this.removeSpecificArr(this.hand, cardInHand);
            this.updateHand();
            this.updatePiles();
        }
        else if(playable == true & pileChoice == 2){
            this.cancel();
            this.pile2.unshift(cardInHand);
            this.hand = this.removeSpecificArr(this.hand, cardInHand);
            this.updateHand();
            this.updatePiles();
        }

        if(this.hand.length === 0 && this.deck.length === 0){
            this.winGame();
        }
    }

    //Game win sequence
    winGame(){
        alert("You Win!");
        this.endGame();
    }

    //Game loss sequence
    loseGame(){
        alert("Game Over...");
        this.endGame();
    }

    //Game end sequence
    endGame(){
        this.clearArray(this.hand);
        this.clearArray(this.deck);
        this.clearArray(this.backup1);
        this.clearArray(this.backup2);
        this.clearArray(this.pile1);
        this.clearArray(this.pile2);
        this.updateHand();
        this.updateBackups();
        this.updatePiles();
        this.updateDeck();
        this.ended = true;
        clearInterval(this.timer);
    }

    //Functions that trigger on click of element

    //"Flips" the top card of backup piles onto the play piles
    flipPile (event){
        let handler = event.target.scriptH;
        if(handler.backup1.length == 0 || handler.backup2.length == 0){
            handler.loseGame();
            return;
        }
            const drawNext = handler.backup1[0];
            handler.pile1.unshift(drawNext);
            handler.backup1.shift();
            const drawNext2 = handler.backup2[0];
            handler.pile2.unshift(drawNext2);
            handler.backup2.shift();
            handler.updatePiles();
            handler.updateBackups();
    }

    //Records the hand card you clicked last, enables clicking on piles, and disables certain events
    clickHand(event){
        let handler = event.target.scriptH;
        event.target.style.bottom = '50px';
        handler.cancelCard.style.display = 'block';  

        for(this.cardElement of handler.handElement.children){
            this.cardElement.removeEventListener('click', handler.clickHand);
        }
        handler.deckElement.removeEventListener('click', handler.drawFromDeck);
        handler.backup1Element.removeEventListener('click', handler.flipPile);
        handler.backup2Element.removeEventListener('click', handler.flipPile);

        handler.pile1Element.addEventListener('click', handler.clickPile);
        handler.pile2Element.addEventListener('click', handler.clickPile);

    }

    //Handles clicking a pile after clicking a hand card
    clickPile(event){
        const handler = event.target.scriptH;
        const pnum = event.target.pileNum;
        handler.playCard(pnum);
    }

    //Functions to change visual elements

    //Updates visuals for the piles
    updatePiles(){
        if(this.pile1.length == 0){
            this.pile1Element.src = "PlayingCards/EmptyHidden.png";
        }
        else{
            const card = this.pile1[0];
            this.pile1Element.src = card.corImg;
            this.pile1Element.alt = card.getValueString() + " of " + card.getSuitString();
        }

        if(this.pile2.length == 0){
            this.pile2Element.src = "PlayingCards/EmptyHidden.png";
        }
        else{
            const card = this.pile2[0];
            this.pile2Element.src = card.corImg;
            this.pile2Element.alt = card.getValueString() + " of " + card.getSuitString();
        }
    }

    //Updates visuals for the hand
    updateHand(){
        let index = 0;
        for(this.cardElement of this.handElement.children){
            if(index >= this.hand.length){
                this.cardElement.src = "PlayingCards/EmptyHidden.png";
                this.cardElement.alt = "Empty.";
            }
            else{
                const card = this.hand[index];
                this.cardElement.src = card.corImg;
                this.cardElement.alt = card.getValueString() + " of " + card.getSuitString();
            }
            index++;
        }
    }

    //Updates visuals for the deck
    updateDeck(){
        if(this.deck.length == 0){
            this.deckElement.src = "PlayingCards/EmptyHidden.png";
            this.deckElement.alt = "Empty.";
        }
        else{
            this.deckElement.src = "PlayingCards/Cardback.png";
            this.deckElement.alt = this.deck.length + " cards.";
        }
        this.deckTextElement.innerText = this.deck.length;
    }

    //Updates visuals for the backup piles
    updateBackups(){
        if(this.backup1.length == 0){
            this.backup1Element.src = "PlayingCards/EmptyHidden.png";
            this.backup1Element.alt = "Empty.";
        }
        else{
            this.backup1Element.src = "PlayingCards/Cardback.png";
            this.backup2Element.alt = this.backup2.length + " cards.";
        }

        if(this.backup2.length == 0){
            this.backup2Element.src = "PlayingCards/EmptyHidden.png";
            this.backup2Element.alt = "Empty.";
        }
        else{
            this.backup2Element.src = "PlayingCards/Cardback.png";
            this.backup2Element.alt = this.backup2.length + " cards.";
        }

        this.backup1TextElement.innerText = this.backup1.length;
        this.backup2TextElement.innerText = this.backup2.length;

    }
    
    //Array utilities

    //Clears all elements from an array
    clearArray(array){
        const len = array.length;
        for(let i = 0; i < len; i++){
            array.pop();
        }
    }

    //Shuffles input array
    shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    }

    //Removes specific item from array
    removeSpecificArr(array, item){
        return array.filter(function(e) { return e != item})
    }
}

//Class that represents a card
class Card {
    constructor (suit, value){
        this.suit = suit;
        this.value = value;
        this.corImg = "PlayingCards/" + this.getValueString() + this.getSuitString() + ".png";
    }

    //Allows you to get the string for which suit this is
    getSuitString(){
        switch(this.suit){
            case(1):
                return "Clubs";

            case(2):
                return "Diamonds";

            case(3):
                return "Hearts";

            case(4):
                return "Spades";

            default:
                return "If you're seeing this, something has gone wrong";
        }
    }

    //Allows you to get the string for what value this is
    getValueString(){
        switch(this.value){
            case(1):
                return "Ace";
            case(2):
                return "Two";
            case(3):
                return "Three";
            case(4):
                return "Four";
            case(5):
                return "Five";
            case(6):
                return "Six";
            case(7):
                return "Seven";
            case(8):
                return "Eight";
            case(9):
                return "Nine";
            case(10):
                return "Ten";
            case(11):
                return "Jack";
            case(12):
                return "Queen";
            case(13):
                return "King";  
            default:
                return "If you're seeing this, something has gone wrong";
        }
    }

    getSuitInt() {
        return this.suit;
    }

    getValueIInt() {
        return this.value;
    }

    //Gets whether or not another card is able to be played on this card
    isPlayValid (handCard){
        const value1 = this.value;
        const value2 = handCard.value;
        const diff = Math.abs(value1 - value2);
        return diff == 1 || diff == 12; 
    }
} 