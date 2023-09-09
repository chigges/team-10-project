import type * as TestFunctions from "../testing";

const {sum} = jest.requireActual<typeof TestFunctions>("../testing.ts")

const successCases = [
    {
        id:0,
        input:{a:1, b:1},
        output:2,
    },

    {
        id:1,
        input:{a:2, b:3},
        output:5,
    },

    {
        id:2,
        input:{a:3, b:4},
        output:7,
    },

    {
        id:3,
        input:{a:4, b:5},
        output:9,
    },

    {
        id:4,
        input:{a:5, b:12},
        output:17,
    },
];

describe("Test Sum Function", () => {
    it.each(successCases)("Success Case $id", ({input, output}) => {
        const {a, b} = input;
        expect(sum(a, b)).toBe(output);

    });
});