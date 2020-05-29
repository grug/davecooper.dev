import React from 'react';
import { Link } from 'gatsby';

import { rhythm } from '../utils/typography';
import Footer from '../components/footer';

// import { ThemeToggler } from 'gatsby-plugin-dark-mode';

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  let header;

  if (location.pathname === rootPath) {
    header = (
      <>
        <h1
          style={{
            fontFamily: `Montserrat, sans-serif`,
            fontWeight: '600',
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      </>
    );
  } else {
    header = (
      <h3
        style={{
          fontFamily: `Montserrat, sans-serif`,
          fontWeight: '600',
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    );
  }
  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        backgroundColor: 'var(--bg)',
        color: 'var(--textNormal)',
        minHeight: '100vh',
      }}
    >
      {/* <ThemeToggler>
        {({ theme, toggleTheme }) => (
          <label style={{ float: 'right' }}>
            <input
              type="checkbox"
              onChange={(e) => toggleTheme(e.target.checked ? 'dark' : 'light')}
              checked={theme === 'dark'}
            />{' '}
            Dark mode
          </label>
        )}
      </ThemeToggler> */}
      <header>{header}</header>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
