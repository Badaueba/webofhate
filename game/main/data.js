module.exports = {
    myself : {},
    game : {},
    api : {
        dev : 'http://localhost:9000'
    },
    classes : {
        roo : {
            name : '',
            character : 'roo',
            animations : {
                walkLeft : [18, 19, 20],
                walkRight : [18, 19, 20],
                idle : [0, 1, 2, 3],
                basic_attack : [4, 5],
                second_attack : [6, 7, 8],
                especial1 : [15, 16, 17]
            },
            speed : 3
        },

        dwight : {
            name : '',
            character : 'dwight',
            animations : {
                walkLeft : [6, 7],
                walkRight : [6, 7],
                idle : [0, 1, 2, 3],
                basic_attack : [18, 19],
                especial1 : [8, 9, 10],
                second_attack : [12, 13, 14, 15, 16],

            },
            speed : 1.5
        }
    },
    players : [],
    playersGroup : {},
    UIgroup : {}
}