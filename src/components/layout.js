import React from 'react';
import { Link } from 'gatsby';

import { rhythm } from '../utils/typography';
import Footer from '../components/footer';

import { ThemeToggler } from 'gatsby-plugin-dark-mode';

import sun from '../../content/assets/sun.png';
import moon from '../../content/assets/moon.png';
import Toggle from './toggle';

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
      <ThemeToggler>
        {({ theme, toggleTheme }) => (
          <Toggle
            icons={{
              checked: (
                <img
                  src={moon}
                  width="16"
                  height="16"
                  alt=""
                  style={{ pointerEvents: 'none' }}
                />
              ),
              unchecked: (
                <img
                  src={sun}
                  width="16"
                  height="16"
                  alt=""
                  style={{ pointerEvents: 'none' }}
                />
              ),
            }}
            checked={theme === 'dark'}
            onChange={(e) => toggleTheme(e.target.checked ? 'dark' : 'light')}
          />
        )}
      </ThemeToggler>
      <header>{header}</header>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
