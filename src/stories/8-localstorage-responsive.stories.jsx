import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import ResponsiveLocalStorageLayout from "./8-localstorage-responsive";

export default {
  title: 'Example/ResponsiveLocalStorageLayout',
  Component: ResponsiveLocalStorageLayout,
};

const Template = (args) => <ResponsiveLocalStorageLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
