import Component from '../src/component';
import { tracked } from '../src/tracked';
import buildApp from './test-helpers/test-app';

const { module, test } = QUnit;

module('Component Arguments');

test('Args smoke test', (assert) => {
  let done = assert.async();
  assert.expect(7);

  let parent: ParentComponent;

  class ParentComponent extends Component {
    @tracked firstName = "Tom";
    isDank = true;
    daysOfSleepRequiredAfterEmberConf = 4;
    catNames = ["gorby", "seatac"];

    didInsertElement() {
      parent = this;
    }
  }

  class ChildComponent extends Component {
    oldArgs: any;

    constructor(options: any) {
      super(options);

      assert.propEqual(this.args, {
        firstName: "Tom",
        isDank: true,
        days: 4,
        cats: ["gorby", "seatac"]
      });

      assert.ok(Object.isFrozen(this.args));
      this.oldArgs = this.args;
    }

    didUpdate() {
      assert.propEqual(this.args, {
        firstName: "Thomas",
        isDank: true,
        days: 4,
        cats: ["gorby", "seatac"]
      });

      assert.ok(Object.isFrozen(this.args));
      assert.notStrictEqual(this.args, this.oldArgs);
    }

    @tracked('args')
    get loudName() {
      return this.args.firstName + '!!!';
    }
  }

  let app = buildApp()
    .component('parent-component', ParentComponent)
    .component('child-component', ChildComponent)
    .template('main', '<div><parent-component /></div>')
    .template('parent-component', `
      <div>
        <child-component
          some-attr=foo
          @firstName={{firstName}}
          @isDank={{isDank}}
          @days={{daysOfSleepRequiredAfterEmberConf}}
          @cats={{catNames}} />
      </div>`)
    .template('child-component', `
      <div>
        <div id="loud-name">{{loudName}}</div>
        {{#each @cats key="@index" as |cat|}}
          {{cat}}
        {{/each}}
      </div>`)
    .boot();

  assert.equal(app.rootElement.querySelector('#loud-name').textContent, 'Tom!!!');

  parent.firstName = "Thomas";

  setTimeout(() => {
    assert.equal(app.rootElement.querySelector('#loud-name').textContent, 'Thomas!!!');
    done();
  }, 0);
});
