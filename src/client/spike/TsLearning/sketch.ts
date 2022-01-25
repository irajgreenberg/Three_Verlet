class TestClass {
    // explicit property declaration
    // public access by default
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
        console.log(name, "is", age);
    }
}

new TestClass("Ira", 55);