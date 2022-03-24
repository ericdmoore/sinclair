export class Example {
    str;
    constructor(str){
        this.str = str
    }
    speak(){return this.str}
}

export const doofusFactory = () => {
    return new Example()
}

export default Example