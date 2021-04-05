import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import NoCollisionLayout from "./12-prevent-collision";
export default {
  title: 'Example/NoCollisionLayout',
  Component: NoCollisionLayout,
};

const Template = (args) => <NoCollisionLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
