class Example {
    constructor(str){
        this.str = str
    }
    speak(){return this.str}
}

const doofusFactory = () => {
    return new Example()
}

exports = {default: Example, Example, doofusFactory}