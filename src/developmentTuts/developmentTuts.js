import _ from 'lodash'
import React,{Component} from 'react'
import { Header, Icon,  List , Button  , Grid ,Loader,Input} from 'semantic-ui-react'
import axios from 'axios';

class DeveloperArticles extends Component {
    constructor(props){
        super(props);
        this.state = {
            blogs:[],
            blog:{},
            logged:false,
            isLoaded: false,
            blogIsLoading:false
        };
        this.goToHome = this.goToHome.bind(this);
        this.onReadMore = this.onReadMore.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleData = this.handleData.bind(this);
        this.isLoading = this.isLoading.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    };
    onReadMore(thisBlog){
        this.setState({blogIsLoading:true})
        return axios.get('http://zemuldo.com:8090/posts/'+ thisBlog.type +'/'+thisBlog.title, {
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
        this.setState({current:'Zemuldo Tech Blog and Articles'})
    }
    resize = () => this.forceUpdate()
    componentDidMount() {
        this.handleData()
        window.addEventListener('resize', this.resize)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }
    isLoading(value){
        this.setState({ isLoaded: value });
    };
    handleData(){
        return Promise.all([axios.get('http://zemuldo.com:8090/posts/dev', {}),axios.get('http://zemuldo.com:8090/posts/business/How to keep your Customers', {})])
            .then(response => {
                this.setState({blogs:response[0].data,blog:response[0].data[0]})
                this.isLoading(true)
                return response[0].data
            })
            .catch(exception => {
                this.isLoading(true)
                return exception
            });
    };
    handleFilterChange(e) {
        //e.preventDefault();
        if(e.target.value===''){
            return axios.get('http://zemuldo.com:8090/all', {})
                .then(response => {
                    this.setState({blogs:response.data})
                })
                .catch(exception => {
                });
        }
        else {
            return axios.get('http://zemuldo.com:8090/filter/'+e.target.value, {})
                .then(response => {
                    this.setState({blogs:response.data})
                })
                .catch(exception => {
                });
        }
    }
    render(){
        return(
            <div>
                {
                    (this.state.isLoaded) ?
                        <div>
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
                                                    <Header color='green' as='h2'>Developers Articles</Header>
                                                    <List>
                                                        {
                                                            (this.state.blogs[0]) ?
                                                                <div>
                                                                    {
                                                                        (this.state.blogs.length>10) ?
                                                                            <div>
                                                                                { _.times(this.state.blogs.length, i =>
                                                                                    <List.Item key={this.state.blogs[i].title} >
                                                                                        <List.Icon name='leaf' />
                                                                                        <List.Content><Header color='green' as='h3'>{(this.state.blogs[i].title.length>21) ? this.state.blogs[i].title: this.state.blogs[i].title}</Header></List.Content>
                                                                                        <List.Content>Author: {this.state.blogs[i].author}</List.Content>
                                                                                        <List.Content>Likes {i}</List.Content>
                                                                                        <Button size="mini" ref={this.state.blogs[i].title} onClick={() => { this.onReadMore(this.state.blogs[i]) }}  content='Read Full Content' color='green'/>
                                                                                        <hr/>
                                                                                    </List.Item>)
                                                                                }
                                                                            </div>:
                                                                            <div>
                                                                                {
                                                                                    this.state.blogs.map((x, i) =>
                                                                                        <List.Item key={this.state.blogs[i].title}>
                                                                                            <List.Icon name='leaf' />
                                                                                            <List.Content><Header color='green' as='h3'>{(this.state.blogs[i].title.length>21) ? this.state.blogs[i].title: this.state.blogs[i].title}</Header></List.Content>
                                                                                            <List.Content>Author: {this.state.blogs[i].author}</List.Content>
                                                                                            <List.Content>Likes {i}</List.Content>
                                                                                            <Button size="mini" ref={this.state.blogs[i].title} onClick={() => { this.onReadMore(this.state.blogs[i]) }}  content='Read Full Content' color='green'/>
                                                                                            <hr/>
                                                                                        </List.Item>
                                                                                    )}
                                                                            </div>
                                                                    }
                                                                </div>:
                                                                <div>
                                                                    No matching data
                                                                </div>
                                                        }
                                                    </List>
                                                    <a onClick={this.goToHome}><Header color='orange' as='h4'>More</Header></a>
                                                </div>
                                            </Grid.Column>:
                                            <p>Hello</p>

                                    }
                                    <Grid.Column  width={this.state.bodySize}>
                                        {
                                            (this.state.blogIsLoading) ?
                                                <div style={{ position:'center', margin: '20em 2em 2em 2em'}}>
                                                    <Loader active inline='centered' />
                                                </div>:
                                                <div style={{margin: '2em 1em 3em 1em'}}>
                                                    {
                                                        (this.state.blog===null) ?
                                                            <div>
                                                                <Header style={{textAlign :'center',alignment:'center'}} color='green' as='h1'>
                                                                    Welcome To ZemuldO.COM
                                                                </Header>
                                                                <hr color="green"/>
                                                                <div style={{margin: '0em 3em 0em 3em'}}>
                                                                    <p>
                                                                        We share content on trending technologies like Artificial Intelligence and BlockChain.
                                                                        You are definitely in the right place. Here you acn get very good content on business, development
                                                                        and technology.
                                                                    </p>
                                                                    <p>
                                                                        We also offer Business and Tech Consultancy. If you are looking for ways to grow your business,
                                                                        We are the choice you are looking for. Reach us for insights and growth.
                                                                    </p>
                                                                </div>

                                                            </div>:
                                                            <div>
                                                                <Header style={{}} color='green' as='h1'>
                                                                    {
                                                                        this.state.blog.title
                                                                    }
                                                                </Header>
                                                                <div style={{}}>
                                                                    Share:
                                                                    <List size="tiny" icon='labeled' horizontal color='green'>
                                                                        <List.Item>
                                                                            <Icon color='blue' name='twitter' />
                                                                        </List.Item>

                                                                        <List.Item >
                                                                            <Icon color='violet' name='facebook' />
                                                                        </List.Item>

                                                                        <List.Item>
                                                                            <Icon color='blue' name='linkedin' />
                                                                        </List.Item>
                                                                        <List.Item>
                                                                            <Icon color='orange' name='google plus official' />
                                                                        </List.Item>
                                                                        <List.Item>
                                                                            <Icon color='red' name='mail' />
                                                                        </List.Item>
                                                                    </List>
                                                                    <br/>
                                                                    Published on:  {this.state.blog.date}  By {this.state.blog.author}
                                                                </div>
                                                                <hr color="green"/>
                                                                <div style={{margin: '0em 3em 0em 3em'}}>
                                                                    <p>
                                                                        {
                                                                            this.state.blog.body
                                                                        }
                                                                    </p>
                                                                </div>

                                                            </div>
                                                    }
                                                </div>
                                        }
                                    </Grid.Column>
                                    {
                                        (window.innerWidth>1030) ?
                                            <Grid.Column  width={2}>


                                            </Grid.Column>:
                                            <p>Hello</p>
                                    }
                                </Grid.Row>
                            </Grid>
                        </div>:
                        <div   style={ {height:window.innerHeight,margin: '20em 3em 1em 0em'}}>
                            <Loader active inline='centered' />
                        </div>
                }
            </div>)
    }
}
export default DeveloperArticles