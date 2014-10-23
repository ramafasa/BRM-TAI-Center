package com.accenture.environment.manager.data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import org.apache.log4j.Logger;
import org.tmatesoft.svn.core.SVNDirEntry;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNLogEntry;
import org.tmatesoft.svn.core.SVNNodeKind;
import org.tmatesoft.svn.core.SVNURL;
import org.tmatesoft.svn.core.auth.ISVNAuthenticationManager;
import org.tmatesoft.svn.core.io.SVNRepository;
import org.tmatesoft.svn.core.io.SVNRepositoryFactory;
import org.tmatesoft.svn.core.wc.SVNWCUtil;

import com.accenture.environment.manager.beans.SVNFile;
import com.accenture.environment.manager.beans.SVNHistory;
import com.accenture.environment.manager.utils.ApplicationProperties;
import com.accenture.environment.manager.utils.SVNBranchData;

public class SVNDataProvider {

	final private ApplicationProperties applicationProperties = ApplicationProperties.getInstance();
	final static Logger logger = Logger.getLogger(SVNDataProvider.class);
	
	private static int counter = 0;
	
	public Collection<SVNBranchData> getSVNBranches() {
		
		return applicationProperties.getSvnBanches().values();	
	}
	
	@SuppressWarnings("deprecation")
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
	
	@SuppressWarnings({ "deprecation", "rawtypes" })
	public List<SVNHistory> getSVNFileHistory(String branchName, String filePath, long maxRevision) {
		
		logger.debug("Retreving SVN history for the file '" + filePath + "'...");
		
		SVNRepository repository = null;
		String svnUrl = applicationProperties.getSvnBanches().get(branchName).getUrl();
		List<SVNHistory> retHistory = new ArrayList<SVNHistory>();
				
		logger.debug("Connecting to SVN: " + svnUrl);
		
		try {
			
			repository = SVNRepositoryFactory.create(SVNURL.parseURIDecoded(svnUrl));
			ISVNAuthenticationManager authManager = SVNWCUtil.createDefaultAuthenticationManager( applicationProperties.getSvnBanches().get(branchName).getUsername(), applicationProperties.getSvnBanches().get(branchName).getPassword());
			repository.setAuthenticationManager(authManager);
			
			Collection logEntries = repository.log(new String[] {filePath}, null, 0, maxRevision, false, true);
        	
        	for (Iterator logEntryIter = logEntries.iterator(); logEntryIter.hasNext();) {
        		
        		SVNLogEntry logEntry = (SVNLogEntry) logEntryIter.next();
        		SVNHistory svnHistory = new SVNHistory();
        		svnHistory.setAuthor(logEntry.getAuthor());
        		svnHistory.setComment(logEntry.getMessage());
        		svnHistory.setDate(logEntry.getDate());
        		svnHistory.setRevision(logEntry.getRevision());
        		
        		retHistory.add(svnHistory);        	
        	}
        	
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
		
		return retHistory;
		
	}
	
	
	@SuppressWarnings("unchecked")
	private void listEntries(SVNRepository repository, String path, List<SVNFile> svnFiles) throws SVNException {
        
		Collection<SVNDirEntry> entries = repository.getDir(path, -1 , null , (Collection<SVNDirEntry>) null );
        Iterator<SVNDirEntry> iterator = entries.iterator( );
              
        while ( iterator.hasNext( ) ) {
        	
        	if(counter++ > 50)
            	return;
            
        	SVNFile file = new SVNFile();
        	SVNDirEntry entry = ( SVNDirEntry ) iterator.next( );
        	
        	        	
        	if(path.equals("")) {
        		file.setParent("#");
        		file.setId(entry.getName().replace('.',  '-') + "_id");
        	}
        	else {
        		String[] pathMembers = path.split("/");
        		String id = "";
        		String parent = "";
        		
        		for(int i=0; i<pathMembers.length; i++) {
        			id += pathMembers[i].replace('.',  '-');
        			parent += pathMembers[i].replace('.',  '-');
        			
        			if(i != pathMembers.length-1) {
        				id += "-";
        				parent += "-";
        			}        				
        		}
        		
        		id += "-" + entry.getName() + "_id";
        		parent += "_id";
        	
        		file.setId(id);
        		file.setParent(parent);
        	}	        	
        	
        	file.setAuthor(entry.getAuthor());
        	file.setFilepath(path + "/" + entry.getName());
        	file.setDate(entry.getDate());        	
        	file.setRevision(entry.getRevision());
        	file.setText(path + "/" + entry.getName());
        	file.setDirectory(entry.getKind() == SVNNodeKind.DIR);
        	
        	svnFiles.add(file);
            
            if ( entry.getKind() == SVNNodeKind.DIR ) {
                listEntries( repository, ( path.equals("") ) ? entry.getName() : path + "/" + entry.getName(), svnFiles );
            }
        }
    }	
}
