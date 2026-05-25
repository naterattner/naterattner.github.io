const projects = [
  {
    title: "See How SpaceX Is About to Eclipse Every Other Blockbuster IPO",
    url: "https://www.wsj.com/tech/spacex-ipo-charts-graphs-9144ec5e?st=aohvug&reflink=desktopwebshare_permalink",
    image: "spacex_ipo.gif",
    source: "The Wall Street Journal"
  },
  {
    title: "Detroit Automakers Take $50 Billion Hit as EV Bubble Bursts",
    url: "https://www.wsj.com/business/autos/detroit-automakers-take-50-billion-hit-as-ev-bubble-bursts-06a97414",
    image: "evpullback.png",
    source: "The Wall Street Journal"
  },
  {
    title: "Courts of New York: A visual atlas of the city\u2019s public basketball spaces",
    url: "https://naterattner.com/courts-of-new-york/",
    image: "courts.png",
    source: "CUNY Graduate Center"
  },
  {
    title: "Palantir\u2019s Market Value Skyrocketed. See How Its Revenue Is Still Catching Up.",
    url: "https://www.wsj.com/finance/stocks/palantir-pltr-stock-value-revenue-charts-c8a7a53e",
    image: "palantir.gif",
    source: "The Wall Street Journal"
  },
  {
    title: "The Paramount and Warner Bros. Assets That Would Make a Media Behemoth",
    url: "https://www.wsj.com/business/media/paramount-warner-discovery-deal-charts-71f95b3a",
    image: "parawarner.png",
    source: "The Wall Street Journal"
  },
  {
    title: "After Pledging to Keep Prices Low, Amazon Hiked Them on Hundreds of Essentials",
    url: "https://www.wsj.com/business/retail/amazon-price-hikes-essentials-60a7c7f3",
    image: "prices.png",
    source: "The Wall Street Journal"
  },
  {
    title: "The Social-Media Influencers Reshaping How Young Americans Get Their Political News",
    url: "https://www.wsj.com/politics/elections/tiktok-news-influencers-social-media-politics-14c1595d",
    image: "newsinfluencers.png",
    source: "The Wall Street Journal"
  },
  {
    title: "DOGE Is Searching for Wasteful Spending. It Isn\u2019t Hard to Find.",
    url: "https://www.wsj.com/politics/policy/doge-musk-government-waste-spending-charts-109f3bcf?st=ocNpoR&reflink=desktopwebshare_permalink",
    image: "doge.png",
    source: "The Wall Street Journal"
  },
  {
    title: "Breaking Down the Tech Giants\u2019 AI Spending Surge",
    url: "https://www.wsj.com/finance/stocks/breaking-down-the-tech-giants-ai-spending-surge-e282ca24?st=XBCvRo&reflink=desktopwebshare_permalink",
    image: "aicapex.png",
    source: "The Wall Street Journal"
  },
  {
    title: "AI Talent Is in Demand as Other Tech Job Listings Decline",
    url: "https://www.wsj.com/tech/ai/ai-jobs-demand-tech-layoffs-5b7344c0?st=7jq96a50olmeuov&reflink=desktopwebshare_permalink",
    image: "aijobs.png",
    source: "The Wall Street Journal"
  },
  {
    title: "Watching Sports Is a Mess. Can a New Streaming Service Fix That?",
    url: "https://www.wsj.com/business/media/sports-streaming-espn-fox-warner-services-0fec07ea?st=vjzlehtrpnf0mh4&reflink=desktopwebshare_permalink",
    image: "sportswatchers.gif",
    source: "The Wall Street Journal"
  },
  {
    title: "How Prime-Time TV Will Look Different This Fall",
    url: "https://www.wsj.com/business/media/how-prime-time-tv-will-look-different-this-fall-63ff818c?st=9rghk1rtvpczgfw&reflink=desktopwebshare_permalink",
    image: "primetimetv.png",
    source: "The Wall Street Journal"
  },
  {
    title: "TV\u2019s Golden Era Proved Costly to Streamers",
    url: "https://www.wsj.com/articles/tvs-golden-era-proved-costly-to-streamers-87353c61?st=98sdh3nfe7hvmzg&reflink=desktopwebshare_permalink",
    image: "goldenera.png",
    source: "The Wall Street Journal"
  },
  {
    title: "New York Yankees\u2019 Aaron Judge Slugs His Way Toward Home Run Milestone",
    url: "https://www.wsj.com/articles/new-york-yankees-slugger-aaron-judge-pursues-bid-for-home-run-milestone-11662217200?st=3vma2yrt9tpgob2&reflink=desktopwebshare_permalink",
    image: "judgeviz.png",
    source: "The Wall Street Journal"
  },
  {
    title: "The U.S. has spent most of its Covid relief funding, but there are still billions left to dole out",
    url: "https://www.cnbc.com/2021/12/09/covid-relief-bills-us-has-spent-most-of-coronavirus-aid-money.html",
    image: "covidrelief.png",
    source: "CNBC"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects");
  projects.forEach(project => {
    const item = document.createElement("div");
    item.className = "grid-item";

    item.innerHTML = `
      <a href="${project.url}" target="_blank">
        <img src="images/${project.image}" alt="Thumbnail for ${project.title}">
      </a>
      <div class="project-label"><a href="${project.url}" target="_blank">${project.title}</a></div>
      <div class="project-source">${project.source}</div>
    `;

    container.appendChild(item);
  });
});
