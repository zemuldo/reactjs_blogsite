import React from 'react'
import { connect } from 'react-redux'
import { Label, Header, Form, Select, Dropdown } from 'semantic-ui-react'
import Creator from '../blogEditor/editor'
import * as VarsActions from '../store/actions/vars'
import { bindActionCreators } from 'redux'
import { topics, categories } from '../env'
import PropTypes from 'prop-types'
import {
  convertFromRaw,
  EditorState,
} from 'draft-js'
import {
  decorator
} from '../blogEditor/editorToolkit'
import DropZone from '../blogEditor/imageUpload'

class EditorsForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      category: null,
      topics: [],
      termsAccept: false,
      about: '',
      dialogInComplete: true,
      editorState: null,
      headerImage: {}
    }
  };

  componentDidMount() {
    this.handleEditorStateCreate()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  handleFormField = (e, data) => {
    this.setState({
      [data.name]: data.name === 'termsAccept' ? data.checked : data.value,
      dialogInComplete: (this.state.topics && this.state.category && this.state.termsAccept)
    })
  }

  onFinishClick = () => {
    let blogDta = {
      type: this.state.category,
      topics: this.state.topics,
      about: this.state.about,
      headerImage: this.state.headerImage
    }
    window.localStorage.setItem('blogData', JSON.stringify(blogDta))
    this.setState({ filledForm: false })
    this.updateVars([{ key: 'editingMode', value: true }])
  }

  updateVars = (vars) => {
    let newVars = this.props.vars
    for (let i = 0; i < vars.length; i++) {
      newVars[vars[i].key] = vars[i].value
    }
    this.props.varsActions.updateVars(newVars)
  };
  handleEditorStateCreate = () => {
    const title = localStorage.getItem('title')
    const state = window.localStorage.getItem('draftContent')
    const blogDataState = window.localStorage.getItem('blogData')
    if (state && blogDataState) {
      let editorState = JSON.parse(state);
      this.setState({
        title: title ? title : '',
        hasSavedContent: false,
        filledForm: true,
        continueEdit: true,
        firstBlock: editorState.blocks[0],
        editorState: EditorState.createWithContent(convertFromRaw(editorState), decorator)
      })
    } else {
      this.setState({ filledForm: true, editorState: EditorState.createEmpty(decorator) })
    }
  };

  handleGetImage = (imageInfo) => {
    this.setState({ headerImage: imageInfo })
  }

  render() {
    return (
      <div>
        {
          !this.props.vars.editingMode
            ? <div>
              <Header color='green' as='h3'>
                Creating your Article is easy. Save and continue where you left..
                       </Header>
              Lets get a few things ready first. this.
              Fill the form below to feed details of your article.
                       <Form style={{ padding: '2em 2em 2em 2em' }}>
                <br />
                <Form.Group widths='equal'>
                  <Form.Field inline>
                    <Label style={{ border: 'none' }} as='a' size='large' color='blue'>Select
                                   Category</Label>{'   '}
                    <Select name='category' style={{ margin: '0em 0em 1em 0em', color: 'green' }}
                      onChange={this.handleFormField} placeholder='Select Category'
                      options={categories} />
                  </Form.Field>
                </Form.Group>
                <Form.Group inline>
                  <Form.Field>
                    <Label style={{ border: 'none' }} as='a' size='large' color='blue'>Select
                                   Tags</Label>{'   '}
                    <Dropdown className='pointer' name='topics' style={{ margin: '0em 0em 1em 0em', color: 'green' }}
                      onChange={this.handleFormField} multiple search selection
                      closeOnChange options={topics} placeholder='Select topics' />
                  </Form.Field>
                </Form.Group>
                <Header as='h3'>Header Picture</Header>
                <Form.Group inline>
                  <DropZone handleGetImage={this.handleGetImage} />
                </Form.Group>
                <Form.TextArea name='about' maxLength='140' onChange={this.handleFormField} label='About your blog'
                  placeholder='Small details about your article...upto 140 Characters' />
                <Form.Checkbox name='termsAccept' onChange={this.handleFormField}
                  label='I agree to the Community Terms and Conditions' />
                <Form.Button
                  disabled={this.state.topics.length < 1 || this.state.about.length < 139 || !this.state.category || !this.state.termsAccept}
                  type='button' onClick={this.onFinishClick} color='green'
                  size='large'>Submit</Form.Button>
                <Form.Button type='button' onClick={() => this.updateVars([{
                  key: 'editingMode',
                  value: false
                }, { key: 'createNew', value: false }])} color='green' size='large'>Exit</Form.Button>
              </Form>
            </div>
            : <div>
              {
                this.state.editorState ?
                  <Creator
                    initEditorState={this.state.editorState}
                    editorState={JSON.stringify(EditorState.createEmpty())}
                    mode='create'
                    currentUser={this.props.currentUser}
                    topics={this.state.topics}
                    category={this.state.category}
                  /> :
                  <div>Loading state</div>
              }
            </div>
        }
      </div>

    )
  }
}

const mapStateToProps = (state) => {
  return {
    vars: state.vars
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    varsActions: bindActionCreators(VarsActions, dispatch)
  }
}

EditorsForm.propTypes = {
  varsActions: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  vars: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorsForm)
