import React from 'react';
import "../css/styles.css";
import "../css/example-styles.css";
import LocalStorageLayout from "./7-localstorage";
export default {
  title: 'Example/LocalStorageLayout',
  Component: LocalStorageLayout,
};

const Template = (args) => <LocalStorageLayout {...args} />;

export const Example = Template.bind({});
Example.args = {

};
