var TestClass = /** @class */ (function () {
    function TestClass(name, age) {
        this.name = name;
        this.age = age;
        console.log(name, "is", age);
    }
    return TestClass;
}());
new TestClass("Ira", 55);
