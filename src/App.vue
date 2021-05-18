<template>
  <div id="app">
    <div class="row no-gutters">
        <div class="col-md-4 col-xl-2 text-center left-nav">
            <div class="nav-branding" style="padding-top:1em;"><img src="@/assets/img/logo.svg">
                <p style="margin-top: 8px;margin-bottom: 0px;">Unofficial interface created by&nbsp;<a href="https://github.com/WardPearce" target="_blank">Ward Pearce</a></p>
            </div>
            <div class="nav-branding">
                <h6>Credits:&nbsp;<span style="color: var(--dathost-orange);">16.76 NZD</span></h6>
                <h6 style="margin-bottom: 0px;">This will last&nbsp;<span style="color: var(--dathost-orange);">indefinitely</span></h6>
            </div>
            <div class="text-left nav-footer">
                <b-dropdown id="dropdown-dropright" block size="lg" dropright text="Account" variant="primary">
                    <b-dropdown-item href="#"><b-icon icon="credit-card"></b-icon> Billing</b-dropdown-item>
                    <b-dropdown-item href="#"><b-icon icon="tv"></b-icon> Interface</b-dropdown-item>
                    <b-dropdown-item href="#" style="background: var(--red);"><b-icon icon="arrow-bar-right"></b-icon> Logout</b-dropdown-item>
                </b-dropdown>
                <div class="disclaimer">
                    <p style="margin-bottom: 5px;">This interface is completely serverless, all your data is sent directly to dathost.net/api.</p>
                    <p style="margin-bottom: 5px;">This site stores local cookies what contain identifiers, this is purely for functionality.</p>
                    <p style="margin-bottom: 5px;">This website has zero&nbsp;affiliation with dathost.net.</p><a href="https://github.com/UnofficialDathost/Interface" target="_blank">Proudly licensed under&nbsp;GNU Affero 3</a>
                </div>
            </div><button class="btn btn-primary btn-lg text-uppercase" type="button">&nbsp;<b-icon icon="plus" scale="1.7"></b-icon>&nbsp;Add Game Server</button>
        </div>
        <div class="col-md-8 col-xl-10">
            <div class="container-fluid content">
                <router-view/>
            </div>
        </div>
    </div>
  </div>
</template>
