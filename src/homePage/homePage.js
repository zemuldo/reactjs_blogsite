import _ from 'lodash'
import React,{Component} from 'react'
import { Header, Icon,  List , Button  , Grid ,Loader,Input} from 'semantic-ui-react'
import { Timeline } from 'react-twitter-widgets'
import axios from 'axios';
import WelcomePage from './welCome'
import About from '../partials/aboutHome'
import Blogs from '../partials/blogs'
import Blog from '../partials/blog'
import config from '../environments/conf'
const env = config[process.env.NODE_ENV] || 'development'
class HomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            blogs:[],
            blog:null,
            logged:false,
            isLoaded: false,
            blogIsLoading:false,
            bodySize:(window.innerWidth<503)?16:12
        };
        this.goToHome = this.goToHome.bind(this);
        this.onReadMore = this.onReadMore.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleData = this.handleData.bind(this);
        this.isLoading = this.isLoading.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this._handleChangeBodySize = this._handleChangeBodySize.bind(this);
        this.tick = this.tick.bind(this);
        this.setCurrentBlog = this.setCurrentBlog.bind(this);

    };
    tick () {
        return Promise.all([axios.get(env.httpURL+'/all', {}),axios.get(env.httpURL+'/posts/business/How to keep your Customers', {})])
            .then(response => {
                if(response[0].data[0]){
                    this.setState({blogs:response[0].data})
                }
            })
            .catch(exception => {

            });
    }
    onReadMore(thisBlog){
        this.setState({blogIsLoading:true})
        return axios.get(env.httpURL+'/posts/'+ thisBlog.type +'/'+thisBlog.title, {
        })
            .then(response => {
                this.setState({blog:response.data})
                this.isLoading(true)
                this.setState({blogIsLoading:false})
                window.scrollTo(0,0)
                return response
            })
            .catch(exception => {
                this.isLoading(true)
                return exception
            });
    }
    goToHome(){
        this.setState({current:'ZemuldO-Home'})
    }
    _handleChangeBodySize(size){
        this.setState({bodySize:size})
    }
    resize = () => this.forceUpdate();
    setCurrentBlog(title){
        return axios.get(env.httpURL+'/posts/all/'+title, {
        })
            .then(response => {
                if(response.data.error){
                }
                else {
                    this.setState({blog:response.data})
                    this.isLoading(true)
                    this.setState({blogIsLoading:false})
                    window.scrollTo(0,0)
                }

            })
            .catch(exception => {
                this.isLoading(true)
                return exception
            });
    }
    componentDidMount() {
        this.setCurrentBlog(window.location.pathname.slice(1,window.location.pathname.length).split('%20').join(' '))
        this.interval = setInterval(this.tick, 30000);
        this.forceUpdate()
        if(window.innerWidth<503){
            this._handleChangeBodySize(16)
        }
        if(window.innerWidth>503){
            this._handleChangeBodySize(16)
        }

        this.handleData()
        window.addEventListener('resize', this.resize)
        return Promise.all([axios.get(env.httpURL+'/all', {}),axios.get(env.httpURL+'/posts/business/How to keep your Customers', {})])
            .then(response => {
                if(response[0].data[0]){
                    this.setState({blogs:response[0].data})
                }
            })
            .catch(exception => {

            });
    }
    componentWillUnmount() {
        clearInterval(this.interval);
        window.removeEventListener('resize', this.resize)
    }
    isLoading(value){
        this.setState({ isLoaded: value });
    };
    handleData(){
        return Promise.all([axios.get(env.httpURL+'/all', {}),axios.get(env.httpURL+'/posts/business/How to keep your Customers', {})])
            .then(response => {
                if(response[0].data[0]){
                    this.setState({blogs:response[0].data})
                }
                else{
                    this.setState({blogs:[],blog:null})
                }
                this.isLoading(true)
                return response[0].data
            })
            .catch(exception => {
                this.setState({blogs:[],blog:null})
                this.isLoading(true)
                return exception
            });
    };

    handleFilterChange(e) {
        //e.preventDefault();
        if(e.target.value===''){
            return axios.get(env.httpURL+'/all', {})
                .then(response => {
                    this.setState({blogs:response.data})
                })
                .catch(exception => {
                });
        }
        else {
            return axios.get(env.httpURL+'/filter/'+e.target.value, {})
                .then(response => {
                    this.setState({blogs:response.data})
                })
                .catch(exception => {
                    this.setState({blogs:[]})
                });
        }
    }
    render(){
        return(
            <div>
                {
                    (this.state.isLoaded) ?
                        <div>
                            {
                                (window.innerWidth>503) ?
                                    <Grid columns={2} divided>
                                        <Grid.Row>
                                            {
                                                (window.innerWidth>600) ?
                                                    <Grid.Column  width={4}>
                                                        <div style={{ float: 'left', margin: '2em 3em 3em 2em'}}>
                                                            <Input
                                                                icon={<Icon name='search' inverted circular link />}
                                                                placeholder='Search...'
                                                                onChange={this.handleFilterChange}
                                                            />
                                                            <Header  color={this.props.color} as='h2'>Most Popular</Header>
                                                            {
                                                                (this.state.blogs[0]) ?
                                                                    <Blogs onReadMore = {this.onReadMore} blogs ={this.state.blogs} blog ={this.state.blog}/>:
                                                                    <div>
                                                                        No matching data
                                                                    </div>
                                                            }
                                                            <a onClick={this.goToHome}><Header color='orange' as='h4'>More</Header></a>
                                                        </div>
                                                    </Grid.Column>:
                                                    <p>Hello</p>

                                            }
                                            <Grid.Column  width={9}>
                                                <WelcomePage blog={this.state.blog} blogs={this.state.blogs} blogIsLoading={this.state.blogIsLoading}/>
                                            </Grid.Column>
                                            {
                                                (window.innerWidth>1030) ?
                                                    <Grid.Column  width={3}>
                                                        <div style={{textAlign:'centre',margin:'2em 0em 0em 0em'}}>
                                                            <Header color='blue' as='h3'>On Twitter</Header>
                                                            <Timeline
                                                                dataSource={{
                                                                    sourceType: 'profile',
                                                                    screenName: 'zemuldo'
                                                                }}
                                                                options={{
                                                                    username: 'zemuldo',
                                                                    height: '300',
                                                                    width: '30'
                                                                }}
                                                            />
                                                        </div>
                                                    </Grid.Column>:
                                                    <p>Hello</p>
                                            }
                                        </Grid.Row>
                                    </Grid>:
                                    <Grid columns={2} divided>
                                        <Grid.Row>
                                            {
                                                (window.innerWidth>600) ?
                                                    <Grid.Column  width={4}>
                                                        <div style={{ float: 'left', margin: '2em 3em 3em 2em'}}>
                                                            <Input
                                                                icon={<Icon name='search' inverted circular link />}
                                                                placeholder='Search...'
                                                                onChange={this.handleFilterChange}
                                                            />
                                                            <Header color={this.props.color} as='h2'>Most Popular</Header>
                                                            {
                                                                (this.state.blogs[0]) ?
                                                                    <Blogs blogs ={this.state.blogs} blog ={this.state.blog}/>:
                                                                    <div>
                                                                        No matching data
                                                                    </div>
                                                            }
                                                            <a onClick={this.goToHome}><Header color='orange' as='h4'>More</Header></a>
                                                        </div>
                                                    </Grid.Column>:
                                                    <p>Hello</p>

                                            }
                                            <Grid.Column  width={16}>
                                                {
                                                    (this.state.blogIsLoading) ?
                                                        <div style={{ position:'center', margin: '16em 2em 2em 2em'}}>
                                                            <Loader active inline='centered' />
                                                        </div>:
                                                        <div style={{margin: '3em 1em 3em 2em'}}>
                                                            {
                                                                (this.state.blog===null) ?
                                                                    <About/>:
                                                                    <Blog blog = {this.state.blog}/>
                                                            }
                                                        </div>
                                                }
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                            }

                        </div>:
                        <div   style={ {height:window.innerHeight,margin: '20em 3em 1em 0em'}}>
                            <Loader active inline='centered' />
                        </div>
                }
            </div>)
    }
}
export default HomePage