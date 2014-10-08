package com.accenture.environment.manager.data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import org.apache.log4j.Logger;
import org.tmatesoft.svn.core.SVNDirEntry;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNNodeKind;
import org.tmatesoft.svn.core.SVNURL;
import org.tmatesoft.svn.core.auth.ISVNAuthenticationManager;
import org.tmatesoft.svn.core.io.SVNRepository;
import org.tmatesoft.svn.core.io.SVNRepositoryFactory;
import org.tmatesoft.svn.core.wc.SVNWCUtil;

import com.accenture.environment.manager.beans.SVNFile;
import com.accenture.environment.manager.utils.ApplicationProperties;
import com.accenture.environment.manager.utils.SVNBranchData;

public class SVNDataProvider {

	final private ApplicationProperties applicationProperties = ApplicationProperties.getInstance();
	final static Logger logger = Logger.getLogger(SVNDataProvider.class);
	
	private static int counter = 0;
	
	public Collection<SVNBranchData> getSVNBranches() {
		
		return applicationProperties.getSvnBanches().values();	
	}
	
	public List<SVNFile> getSVNFileTree(String branchName) {
		
		counter = 0;
		
		SVNRepository repository = null;
		String svnUrl = applicationProperties.getSvnBanches().get(branchName).getUrl();
		List<SVNFile> svnFiles = new ArrayList<SVNFile>();		
		
		logger.debug("Connecting to SVN: " + svnUrl);
		
		try {
			
			repository = SVNRepositoryFactory.create(SVNURL.parseURIDecoded(svnUrl));
			ISVNAuthenticationManager authManager = SVNWCUtil.createDefaultAuthenticationManager( applicationProperties.getSvnBanches().get(branchName).getUsername(), applicationProperties.getSvnBanches().get(branchName).getPassword());
			repository.setAuthenticationManager(authManager);
			
			listEntries(repository, "", svnFiles);
			
		} catch (SVNException e) {
			
			logger.error("Error while connecting to SVN " + svnUrl);
			e.printStackTrace();
		} catch (Exception e) {
			logger.error("Critical Exception!");
			e.printStackTrace();
		}
		finally {
			repository.closeSession();
		}
		
		return svnFiles;
		
	}
	
	
	private void listEntries(SVNRepository repository, String path, List<SVNFile> svnFiles) throws SVNException {
        
		Collection<SVNDirEntry> entries = repository.getDir(path, -1 , null , (Collection<SVNDirEntry>) null );
        Iterator<SVNDirEntry> iterator = entries.iterator( );
              
        
        
        while ( iterator.hasNext( ) ) {
        	
        	/*if(counter++ > 200)
            	return;*/
            
        	SVNFile file = new SVNFile();
        	SVNDirEntry entry = ( SVNDirEntry ) iterator.next( );
        	
        	if(path.equals(""))
        		file.setParent("#");
        	else {
        		String[] pathMembers = path.split("/");
        		file.setParent(pathMembers[pathMembers.length - 1].replace('.',  '-') + "_id");
        	}
        	
        	file.setAuthor(entry.getAuthor());
        	file.setFilepath(path);
        	file.setDate(entry.getDate());
        	file.setId(entry.getName().replace('.',  '-') + "_id");
        	file.setRevision(entry.getRevision());
        	file.setText(path + "/" + entry.getName());
        	file.setDirectory(entry.getKind() == SVNNodeKind.DIR);
        	
        	
        	
        	/*logger.debug( "/" + (path.equals( "" ) ? "" : path + "/" ) + entry.getName( ) + 
                               " ( author: '" + entry.getAuthor( ) + "'; revision: " + entry.getRevision( ) + 
                               "; date: " + entry.getDate( ) + ")" );*/
        	
        	
            
            svnFiles.add(file);
            
            if ( entry.getKind() == SVNNodeKind.DIR ) {
                listEntries( repository, ( path.equals("") ) ? entry.getName() : path + "/" + entry.getName(), svnFiles );
            }
        }
    }
	
	
	
	
	
	
	
	
	
	
	
	
	
}
