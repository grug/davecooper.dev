import React from "react"

import { rhythm } from "../utils/typography"

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(2.5),
          paddingTop: rhythm(1),
        }}
      >
        <div style={{ float: "right" }}>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
            RSS
          </a>
        </div>
        <a
          href="https://twitter.com/davewritescodes"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>{" "}
        &bull;{" "}
        <a
          href="https://github.com/grug"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        &bull;{" "}
        <a
          href="https://stackoverflow.com/users/3894430/dave-cooper"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stack Overflow
        </a>
      </footer>
    )
  }
}

export default Footer
