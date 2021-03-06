/*

  The Loader component is largely not needed anymore (mid-development I switched from hosting the database
  to calling the API, and hosting the database was very slow) but it doesn't hurt. I imagine the possibility
  of lag if the collection of submitted links gets large enough.

  My main priorities here are uniqueness and URL validity. Does it resemble a URL? Is the generated/custom
  supplied alias unique? I would be less worried about this if I hadn't enabled a custom alias field.

  In retrospect, I would consider adding a persistency around assigning the randomly generated alias.
  (If shortid generates an already used alias, generate another instead of erroring out,
  but this is overkill for the current implementation)

*/

import React, {Component} from 'react'
import shortid from 'shortid'
import validUrl from 'valid-url'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../../actions'
import { BeatLoader } from 'react-spinners'

import './url-form.css'

class UrlForm extends Component {
  state = {
    isUnique: true,
    isValid: true,
    isLoading: false
  }

  onSubmitUrlClick = async () => {
    const { isValid } = this.state
    const { fetchUrl } = this.props.actions
    const longUrl = document.getElementById('longUrl')
    const alias = document.getElementById('alias')
    const aliasValue = alias.value === "" ? shortid.generate() : alias.value

    this.setState({ isValid: validUrl.isWebUri(longUrl.value) })

    await fetchUrl(aliasValue)

    if (this.props.url.createdAt === undefined) {
      this.setState({isUnique: true})
    } else {
      this.setState({isUnique: false})
    }

// I don't know why this won't deconstruct but it wouldn't run after deconstructing isUnique above.

    if (isValid && this.state.isUnique) {
      this.setState({isLoading: true})
      await this.props.submitUrlForm({
        longUrl: longUrl.value,
        alias: aliasValue
      })
      this.setState({isLoading: false})

      longUrl.value = ""
      alias.value = ""

      longUrl.focus()
    }
  }

  render() {
    const { isValid, isUnique, isLoading } = this.state
    return (
      <div>
        <div className='url-form'>
          <h1>MUSE</h1>
          <h2>magical url shortening experience</h2>
          {!isValid ? <span className='warning'>URLs must start with <i>http(s)://</i></span> : null}
          <input id="longUrl" className='url-form-input' type="text" placeholder="url" />
          {!isUnique ? <span className='warning'>This alias is not available.</span> : null}
          <input id="alias" className='url-form-input' type="text" placeholder="custom alias eg. domain.com/<alias> (optional)" />
          <button className='url-form-button' onClick={this.onSubmitUrlClick}>SHORTEN</button>
        </div>
        { isLoading
          ? <div className='url-return'>
              <BeatLoader
                color={'#2CBBBB'}
                loading={this.state.isLoading}
              />
            </div>
          : null
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return {
    url: state.url
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UrlForm)
