import React from 'react'
import { Helmet } from 'react-helmet'
import Topics from '../partials/topics'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as BlogsActions from '../store/actions/blogs'
import * as BlogActions from '../store/actions/blog'
import * as UserActions from '../store/actions/user'
import * as VarsActions from '../store/actions/vars'
import axios from 'axios'
import { toTitleCase } from '../util'
import PagesComponent from './page'
import config, { topics } from '../env'
import { pages, topicsOBJ } from '../env'
import PropTypes from 'prop-types'

const env = config[process.env.NODE_ENV] || 'development'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sessionId: null,
            x: 0,
            location: '/',
            queryingBlog: false,
            y: ((window.innerWidth / 100) - 3) <= 1 ? 1 : (window.innerWidth / 100) - 3,
            window: window.innerWidth,
            topics: (window.innerWidth / 100) - 3
        }
    };

    blogsAreLoading(state) {
        this.setState({ blogsLoaded: !state })
    }

    setBlogHere(id, page) {
        let blog
        this.props.varsActions.updateVars({ blogLoaded: false })
        if (this.props.vars[`blog_${id}`]) {
            this.props.blogActions.updateBlog(this.props.vars[`blog_${id}`])
            this.props.varsActions.updateVars({ blogLoaded: true })
            return true
        }
        if (!pages[page]) {
            window.location = '/'
        }
        axios.post(env.httpURL, {
            'queryMethod': 'getPostDetails',
            'queryData': {
                id: id
            }
        })
            .then(o => {
                blog = o.data
                this.props.varsActions.updateVars({currentBlog:o.data})
                return axios.post(env.httpURL, {
                    'queryMethod': 'getPost',
                    'queryData': {
                        'id': id
                    }
                })
            })
            .then((o) => {
                if (!o|| !o || o.data.error) {
                    this.props.history.push('/')
                    this.props.blogActions.updateBlog({ id: null })
                    this.props.varsActions.updateVars({ blogLoaded: true })
                    return false
                }
                let _blog = Object.assign({},o.data,blog)
                this.props.blogActions.updateBlog(_blog)
                this.props.varsActions.updateVars({ blogLoaded: true })
                return _blog
            })
            .then(o => {
                if (o) this.props.varsActions.updateVars({ [`blog_${id}`]: o })
            })
            .catch((err) => {
                console.log(err)
                this.props.history.push('/')
                this.props.blogActions.updateBlog({})
                this.props.varsActions.updateVars({ blogLoaded: true })
            })
    }

    setCurrentBlog(url, page) {
        let id = null
        if (url.indexOf('-') > 0) {
            id = Number(url.split('-')[url.split('-').length - 1])
        }
        if (id && id.toString() !== 'NaN') {
            this.setBlogHere(id, page)
        } else {
            this.props.blogActions.updateBlog({})
            this.props.varsActions.updateVars({ blogLoaded: true })
        }
    }

    handleFilterChange(e) {
        let query = {}
        let queryMthod = 'getAllPosts'
        if (this.props.vars.currentLocation !== 'home') {
            query.type = this.props.vars.currentLocation
        }
        if (e.target.value !== '') {
            query.filter = e.target.value
            queryMthod = 'getFiltered'
        }

        let run = () => {

            this.setState({ blogsAreLoading: true })
            e.preventDefault()
            axios.post(env.httpURL, {
                'queryMethod': queryMthod,
                'queryData': query
            })
                .then(response => {
                    this.props.blogsActions.updateBlogs(response.data)
                    this.setState({ blogsAreLoading: false })
                })
                .catch(err => {
                    this.setState({ blogs: [] })
                    this.setState({ blogsAreLoading: false })
                })
        }
        clearTimeout(run)
        setTimeout(run, 1500)
    }

    navigateBlogs(query) {
        this.props.varsActions.updateVars({ blogsLoaded: false })
        let q = {
            'queryMethod': 'getPosts',
            'queryData': query
        }
        if (this.props.vars[window.location.pathname]) {
            this.props.blogsActions.updateBlogs(this.props.vars[window.location.pathname])
            this.props.varsActions.updateVars({ blogsLoaded: true })
            return true
        }
        return axios.post(env.httpURL, q)
            .then((response) => {
                if (!response.data) {
                    this.props.blogsActions.updateBlogs([])
                    this.props.varsActions.updateVars({ blogsLoaded: true })
                    return false
                } else {
                    this.props.blogsActions.updateBlogs(response.data)
                    this.props.varsActions.updateVars({ blogsLoaded: true })
                }
                if (response.data.length < 1) {
                    if (!this.props.vars.wsFetchBlogDeatils) {
                        this.props.varsActions.updateVars({ wsFetchBlogDeatils: true })
                        this.props.vars.ws.send(JSON.stringify({
                            type: 'topicDetails',
                            pups: 'topicDetails',
                            sessionId: sessionStorage.getItem('sessionId')
                        }))
                    }
                }
            })
            .then(o => {
                this.props.varsActions.updateVars({ [window.location.pathname]: this.props.blogs })
            })
            .catch((err) => {
                this.props.blogsActions.updateBlogs([])
                if (!this.props.vars.wsFetchBlogDeatils) {
                    this.props.varsActions.updateVars({ wsFetchBlogDeatils: true })
                    this.props.vars.ws.send(JSON.stringify({
                        type: 'topicDetails',
                        pups: 'topicDetails',
                        sessionId: sessionStorage.getItem('sessionId')
                    }))
                }
                this.props.varsActions.updateVars({ blogsLoaded: true })
            })
    }

    resize = () => this.forceUpdate();

    scroll = (e) => {
        localStorage.setItem(`scrollTo_${window.location.pathname}`, JSON.stringify({ x: window.scrollX, y: window.scrollY }))
    }

    componentWillUpdate() {
        if (this.state.window !== window.innerWidth) {
            this.setState({
                y: (window.innerWidth / 100) - 3,
                x: 0,
                window: window.innerWidth,
                topics: (window.innerWidth / 100) - 3
            })
        }
    }

    componentWillReceiveProps() {
        if (this.state.location !== window.location.pathname) {
            /*
       This method is used to detect navigation/actions from the user then update the UI.
       ie. Page navigation, Page crops etc
    */
            /*
                Build variables from the window pathname
            */
            let url = window.location.pathname.split('/').join('')
            let id = Number(window.location.pathname.split('-')[window.location.pathname.split('-').length - 1])
            let query = {}
            let page = window.location.pathname.split('/')[1]
            let topic = window.location.pathname.split('/')[2]

            if (url.length < 4) {
                this.setState({ blog: null })
            }
            if (topicsOBJ[topic]) {
                query.topics = topic
            }
            if (pages[page] && page !== 'home' && page !== 'topics') {
                if (page !== 'topics') {
                    query.type = page
                }
            }
            /*
                Navigate to Page.
                User navigated to page from one URL TO ANOTHER.
                Set current location to page and update blogs
                Set current state location to this location
            */
            if (this.state.location !== window.location.pathname) {
                this.navigateBlogs(query)
                this.setCurrentBlog(url, page)
                this.setState({ location: window.location.pathname })
            }

            if (this.props.blog.id && this.props.vars.blogLoaded && (id.toString() === 'NaN' || !id)) {
                this.props.blogActions.resetBlog({ id: null })
            }
            if (this.state.location !== window.location.pathname && page !== this.props.vars.currentLocation) {
                if (id.toString() !== 'NaN' && this.props.blog.id !== id && this.props.vars.blogLoaded === true) {
                    this.props.varsActions.updateVars({ blogLoaded: false })
                    this.setBlogHere(id, page)
                }
            }
        }

    }

    componentDidMount() {
        window.addEventListener('resize', this.resize)
        window.addEventListener('scroll', this.scroll)
        /*
            Take store variable from url. currrent location, topic and blog
            And update blogs
        */
        let url = window.location.pathname.split('/').join('')
        let page = window.location.pathname.split('/')[1]
        let topic = window.location.pathname.split('/')[2]
        /*
            Redirect to home when unknown page is on url
        */
        if (!pages[page]) {
            this.props.history.push('/')
        }
        let query = {}
        if (topicsOBJ[topic]) {
            query.topics = topic
        }
        if (pages[page] && pages[page].name !== 'Home') {
            if (page !== 'topics') {
                query.type = page
            }
            this.props.varsActions.updateVars({ currentLocation: page })
        }
        /*
             update blogs and blog
        */
        this.navigateBlogs(query)
        this.setCurrentBlog(url, page)
        this.forceUpdate()
        if (window.innerWidth < 503) {
        }
        if (window.innerWidth > 503) {
        }
        /*
            Attempt Auto login
        */
        let known = localStorage.getItem('user')
        if (known) {
            let user = JSON.parse(known)
            if (typeof user.avatar === 'string') {
                localStorage.removeItem('user')
                return false
            }
            if (user.firstName && user.lastName && user.userName) {
                if (page === 'login') {
                    this.props.history.push('/')
                }
                this.props.userActions.updateUser(user)
            } else {
                localStorage.removeItem('user')
            }
        }
        if (pages[page] && page !== 'login' && page !== 'signup') {
            this.props.varsActions.updateVars({ currentLocation: page })
        }
        this.forceUpdate()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
        window.removeEventListener('scroll', this.scroll)
    }

    handleContextRef = tag_contextRef => this.setState({ tag_contextRef })

    render() {
        let o = topics.slice(this.state.x, this.state.y)
        const { tag_contextRef } = this.state



        return (
            <div ref={this.handleContextRef}>
                <Container>
                    <Helmet>
                        <meta name='theme-color' content='#4285f4' />
                        <meta name='msapplication-navbutton-color' content='#4285f4' />
                        <meta name='apple-mobile-web-app-status-bar-style' content='#4285f4' />
                        <title>{'ZemuldO-' + toTitleCase(this.props.vars.currentLocation)}</title>
                        <meta name='Danstan Otieno Onyango' content='ZemuldO-Home' />
                    </Helmet>

                    <Topics
                        currentLocation={this.props.vars.currentLocation}
                        topic={this.state.topic}
                        onTopicClick={this.onTopicClick}
                        onAllcClick={this.onAllcClick}
                        blog={this.props.blog}
                        color={this.props.vars.color}
                        blogs={this.props.blogs}
                        resetNav={this.resetNav}
                    />
                    <br />
                    <PagesComponent
                        tag_contextRef={tag_contextRef}
                        history={this.props.history}
                        navigateBlogs={this.navigateBlogs}
                        blogsAreLoading={this.blogsAreLoading}
                    />
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        blog: state.blog,
        blogs: state.blogs,
        user: state.user,
        vars: state.vars
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        blogActions: bindActionCreators(BlogActions, dispatch),
        blogsActions: bindActionCreators(BlogsActions, dispatch),
        userActions: bindActionCreators(UserActions, dispatch),
        varsActions: bindActionCreators(VarsActions, dispatch)
    }
}

App.propTypes = {
    history: PropTypes.object.isRequired,
    blog: PropTypes.object.isRequired,
    blogs: PropTypes.array.isRequired,
    vars: PropTypes.object.isRequired,
    varsActions: PropTypes.object.isRequired,
    blogActions: PropTypes.object.isRequired,
    blogsActions: PropTypes.object.isRequired,
    userActions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
