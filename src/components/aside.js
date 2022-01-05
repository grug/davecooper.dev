import React from 'react';
import styled from 'styled-components';

const StyledAside = styled.aside`
  background-color: hsl(288deg, 53%, 85%);
  padding: 32px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  border-left: 3px solid hsl(288deg, 66%, 63%);

  > p:last-child {
    margin-bottom: 0;
  }
`;

const Aside = ({ children }) => {
  return <StyledAside>{children}</StyledAside>;
};

export { Aside };
