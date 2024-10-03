<template>
  <div class="crawler-container">
    <div class="grid">
      <div class="column is-three-quarters">
        <input
          type="text"
          placeholder="Enter the domain of the site that you want to analyse"
          v-model="url"
        />
      </div>
      <div class="column is-one-quarter">
        <button class="button is-primary" @click="startCrawl">Crawl</button>
      </div>
    </div>

    <div class="crawling" v-if="loading">
      <p>Crawling...analysed {{ urlsCrawled }} links</p>
    </div>

    <table class="table results" v-if="showResults">
      <thead>
        <tr>
          <th>Url</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in urls" :key="index">
          <td>{{ item }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Crawler',
  data() {
    return {
      url: '',
      urls: [],
      crawlDepth: 0,
      visitedUrls: new Set(),
      uniqueUrls: new Set(),
      loading: false,
      urlsCrawled: 0,
      showResults: false
    }
  },
  setup() {
    return {}
  },
  async created() {},
  mounted() {},
  beforeUnmount() {},
  watch: {},
  methods: {
    startCrawl: async function() {
      this.showResults = false
      this.loading = true
      this.uniqueUrls.add(this.url)

      await this.crawl(this.url, this.crawlDepth)
      console.log(`Number of URLs captured - ${this.urlsCrawled}`)
      this.urls = Array.from(this.uniqueUrls)
      
      this.showResults = true
      this.loading = false
    },
    crawl: async function (url) {
      if (this.visitedUrls.has(url)) {
        return
      }

      try {
        let html = await window.electronAPI.fetchViaProxy(url)
        this.visitedUrls.add(url)

        // Parse the HTML using DOMParser
        let parser = new DOMParser()
        let doc = parser.parseFromString(html, 'text/html')

        let links = []
        let anchorElements = doc.querySelectorAll('a[href]')

        anchorElements.forEach((element) => {
          let href = element.getAttribute('href')

          if (!href) {
            return
          }

          // Check for non-URLs
          if (
            href.indexOf('#') > -1 ||
            href.indexOf('javascript:') > -1 ||
            href.indexOf('mailto:') > -1 ||
            href.indexOf('tel:') > -1 ||
            href.indexOf('data:') > -1 ||
            href.indexOf('file:') > -1 ||
            href.indexOf('ftp:') > -1 ||
            href.indexOf('?') > -1
          ) {
            return
          }

          // Resolve the href against the base URL
          href = new URL(href, url).href // Use 'url' instead of 'baseUrl'

          // Check if the URL has already been visited
          if (this.visitedUrls.has(href)) {
            return
          }

          if (href.startsWith(this.url)) {
            this.urlsCrawled++
            this.uniqueUrls.add(href)
            links.push(href)
          }
        })

        // Recursively crawl the discovered links
        for (const link of links) {
          await this.crawl(link, this.crawlDepth + 1)
        }
      } catch (error) {
        console.error(`Error crawling ${url}: ${error.message}`)
      }
    }
  }
}

</script>
