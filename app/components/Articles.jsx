import { React, Reapp, View, NestedViewList, List } from 'reapp-kit';

import RefreshButton from './shared/RefreshButton';
import ArticleItem from './articles/ArticleItem';
import RotatingLoadingIcon from './shared/RotatingLoadingIcon';

export default Reapp(class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    };
  }

  componentWillMount() {
    this.action.articlesHotLoad();
  }

  handleRefresh() {
    if (this.state.refreshing) return;
    this.setState({ refreshing: true });
    this.action.articlesHotRefresh().then(() => {
      this.setState({ refreshing: false });
    });
  }

  handleLoadMore(e) {
    e.target.innerHTML = 'Loading...';
    this.setState({ refreshing: true });
    this.action.articlesHotLoadMore().then(() => {
      this.setState({ refreshing: false });
    });
  }

  render() {
    const store = this.context.store();
    const articles = store.get('hotArticles');
    const id = this.context.router.getCurrentParams().id;
    //通过id查询article主要是为了应对直接输入url（article/id）的方式进入文章详情页
    //主页面的render第一次会被渲染
    //这样会在这里先查询出article的
    const article = id && store.getIn(['articles', Number(id)]);
    const Child = this.props.child;

    return (
      <NestedViewList {...this.props.viewListProps}>
        <View title="Hot Articles" titleRight={
          <RefreshButton
            onTap={this.handleRefresh.bind(this)}
            rotate={this.state.refreshing}
          />
        }>
          {!articles &&
            <div style={styles.iconContainer}>
              <RotatingLoadingIcon />
            </div>
          }

          {articles &&
            <List>
              {articles.map((article, i) =>
                <ArticleItem key={i} index={i}
                  article={store.getIn(['articles', article, 'data'])} />
              )}

              <List.Item
                styles={styles.loadMore}
                onTap={this.handleLoadMore.bind(this)}>
                Load More
              </List.Item>
            </List>
          }
        </View>

        {
        //这一行的参数很重要，可以把上一个组件里的props.article传递到下一个视图的props.article中
        //比如从ArticleItem跳转到Article的时候
        }
        {Child &&
          Child({ article: article })
        }
      </NestedViewList>
    );
  }
});

const styles = {
  iconContainer: {
    padding: 20,
    marginLeft: -10
  },

  loadMore: {
    content: {
      textAlign: 'center',
      padding: 20
    }
  }
};
