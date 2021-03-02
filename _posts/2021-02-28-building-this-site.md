---
layout: post
title: Building this site
subtitle: 
cover-img: 
thumbnail-img: 
share-img: 
tags: 
comments: false
---

This site was built with [Jekyll](https://jekyllrb.com/){:target="_blank"}, a free and open-source static site generator, using the [Beautiful Jekyll](https://github.com/daattali/beautiful-jekyll){:target="_blank"} template. It’s hosted on [Github Pages](https://pages.github.com/){:target="_blank"} and uses a custom domain purchased through GoDaddy. The code is available on [Github](https://github.com/naterattner/naterattner.github.io){:target="_blank"}.

Beautiful Jekyll comes with lots of built-in customization options, but I also extended it with one key element. I searched long and hard for a portfolio-style Jekyll template that featured an image gallery I could use to showcase graphics work, but the existing options felt either [overly minimal](https://jamstackthemes.dev/theme/jekyll-urban/){:target="_blank"} or [not minimal enough](https://volny.github.io/creative-theme-jekyll/){:target="_blank"}.

With the [Lightbox](https://lokeshdhakar.com/projects/lightbox2/){:target="_blank"} library and a CSS image grid, I was able to achieve the clean, mobile-responsive effect I was looking for:

![Crepe](/assets/img/posts/2021-02-28/img_grid.png){: .mx-auto.d-block :}

I also moved the blog off of the homepage, cleaned up some extraneous pages, and customized the CSS styling. 

Looking back, since I'm confortable with a bit of basic web development, I wish I had stopped searching for themes once I found something in the ballpark of what I was looking for and then focused on building in customization from there. I spent as much time looking for the perfect template as it took to implement the features I wanted on top of a basic template.