import React from 'react';
import "../react-grid-layout/css/styles.css";
import "../react-grid-layout/css/example-styles.css";
import MinMaxLayout from "./9-min-max-wh";
export default {
  title: 'Example/MinMaxLayout',
  Component: MinMaxLayout,
};

const Template = (args) => <MinMaxLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
