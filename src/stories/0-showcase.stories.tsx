import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import ShowcaseLayout from "./0-showcase";

export default {
  title: 'Example/ShowcaseLayout',
  Component: ShowcaseLayout,
};

const Template = (args) => <ShowcaseLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
