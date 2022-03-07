<div id="top"></div>
<!-- PROJECT SHIELDS -->
<!-- Reference links are enclosed in brackets [ ] instead of parentheses () -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<!-- # sinclair -->
<!-- A babyish attempt at converting npm modules to becoming deno compatible -->
<br />
<div align="center">
    <a href="//github.com/ericdmoore/sinclair"> 
    <img src="/images/sinclair.gif" alt="Baby Sinclair From the Cult classic Americna 90s TV show Dinosaurs">
    </a>
  <h3 align="center">sinclair</h3>
  <p align="center">
    A babyish attempt at converting npm modules to becoming deno compatible
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template">View Demo</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Report Bug</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#why">Why</a>
      <ul>
        <li><a href="#about-the-project">About The Project</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Process Overview</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## Why

So you started messing around with deno, cool me too. But you keep wondering how to grab some `awesome_node_modules` that you used before? Cool, me too! congratualations you and every other deno-saur have ran into the step change assumptions from @ry - and noow everythihg is better (I think),but I have all this baggage of stuff I want to bring with me to the **new world**.

## About The Project

This project is intended to work with `denopkg.com` and `raw.githubusercontent.com` as such, the node_modules need to be made public. so that relative URL import/exports will work.

That is why this project exists. To help package users quickly migrate old and beloved packages to the new world.

It accomplishes this by:
- Checking in all `node_modules` so they are visible via github, or other SCM
- Then we ensure all deps in node_modules use es6 import/export + default exports


Here's why:
* Your time should be focused on creating something amazing. A project that solves a problem and helps others
* You shouldn't be doing the same tasks over and over like creating a README from scratch
* You should implement DRY principles to the rest of your life :smile:


<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [Typescript](https://www.typescriptlang.org/)
* [Deno](https://deno.land/)

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

```zsh
cd someNodeProjectjs
deno run http://denopkg.com/ericdmoore/sinclair/mod.ts
```

```zsh
cd someNodeProjectjs
npx @ericdmoore/sinclair
```

### Assumptions & Warnings

1. This process changes your repository in place
2. It is highly recommended that you run this process in it's own branch
3. The goal is to get better at handling specific translation stuff: eg: `fs`, `path`, `proc`, etc... better over time - so far the strategy here is to "punt on 3rd down"


### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#top">back to top</a>)</p>

## Process Overview

1. Require -> import
	1. const NAME = require('f') // f = file or NPM name
	2. import NAME from 'f' // f needs to be a relative path or URL
	3. Adjust NPM name to be relative import to the `node_modules` folder
	4. find - replace
		1. find ::  `from '([^\.].+)'` 
		2. replace::  `from '../../$1/index.js'`
1. Named Exports - exports -> export
	1. module.exports.NAME = // CJS
	2. export const NAME =  // ESM
	3. `module.exports.` becomes `export const `
1. Default Exports - module.export =  -> export default
	1. module.export = {{token}}
	2. export default {{token}}
	3. `module.export = ` becomes `export default `
	4. if no default, then keep track of the the exported things, and plop them all in an default object


<!-- ROADMAP -->
## Roadmap

- [ ] Add Changelog
- [ ] Investigate using [`tsd-jsdoc`](https://dev.to/jor/jsdoc-to-typescript-declaration-19fg) for JSDoc Types to Typescript Conversions
- [ ] Add Ref Docs
- [ ] Add Explanation Docs
- [ ] Add Tutorials Docs
- [ ] Add How-To-Guides Docs
- [ ] Multi-language Support
    - [ ] Chinese
    - [ ] Spanish

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

<!-- 1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request -->

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License

MIT © Eric D Moore

See [`LICENSE`](./LICENSE) for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Eric D Moore | [🐦 @ericdmoore](https://twitter.com/ericdmoore) | [📧  eric@☕️.kz](mailto:eric@☕️.kz) | 🌎 Dallas, TX

Project Link: [https://github.com/ericdmoore/sinclair](https://github.com/ericdmoore/sinclair)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

* [Choose an Open Source License](https://choosealicense.com)
* [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
* [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)
* [Malven's Grid Cheatsheet](https://grid.malven.co/)
* [Img Shields](https://shields.io)
* [GitHub Pages](https://pages.github.com)
* [Font Awesome](https://fontawesome.com)
* [Readme Template ](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#top">back to top</a>)</p>

#### namesake:

There was an American TV show in the 90's that had a baby dinosaur that would say adorable things like "Im the baby gotta love me" - his name was Sinclair. Now you know.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
