var game = new Phaser.Game(1000, 1000, Phaser.CANVAS, 'myMainProject-dev'); 


game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('intro', introState);
game.state.add('mainMenu', mainMenuState);
game.state.add('someLevel', gameStateAnyLevel);

game.state.start('boot');

