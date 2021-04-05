import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import MinMaxLayout from "./9-min-max-wh";
export default {
  title: 'Example/MinMaxLayout',
  Component: MinMaxLayout,
};

const Template = (args) => <MinMaxLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
