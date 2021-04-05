import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import ShowcaseLayout from "./0-showcase";

export default {
  title: 'Example/ShowcaseLayout',
  Component: ShowcaseLayout,
};

const Template = (args) => <ShowcaseLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
